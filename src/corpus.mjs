import {emptyBundle} from './fixtures.mjs';
import {extractClaims} from './extractor.mjs';
/** Sólo separadores en una línea completa. Los offsets apuntan al texto suministrado sin normalizarlo. */
export function splitCorpus(text){
  if(typeof text!=='string'||text.length>4000000)throw Error('Máximo 4 MB de texto por corpus.');
  const parts=[];let start=0;const re=/^[ \t]*(?:-{3,}|—)[ \t]*\r?$/gm;
  const push=end=>{let a=start,b=end;while(a<b&&/\s/.test(text[a]))a++;while(b>a&&/\s/.test(text[b-1]))b--;if(a<b)parts.push({id:`H${String(parts.length+1).padStart(3,'0')}`,index:parts.length+1,start:a,end:b,text:text.slice(a,b)});};
  for(const m of text.matchAll(re)){push(m.index);start=m.index+m[0].length;}push(text.length);
  if(parts.length>300)throw Error('Máximo 300 diálogos por carga.');return parts;
}
/** Indicadores léxicos para navegación, NO etiquetas de consenso ni detección exhaustiva de incertidumbre. */
export function uncertaintyCues(text){
  const re=/\b(?:not (?:entirely )?sure|I (?:don[’']t know|think|believe)|unknown|possibly|probably|likely|pending|awaiting|seems?|no (?:sé|sabemos)|por confirmar|pendiente|posible(?:mente)?|quizás)\b/gi;
  return [...text.matchAll(re)].map(m=>({start:m.index,end:m.index+m[0].length,quote:m[0],kind:'lexical_candidate',review:'pending'}));
}
export function dialogueClaims(d){
  const re=/\[([^\]\r\n]{1,70})\]\s*:?|^([A-Z][A-Z &_.()-]{1,55}):/gm;
  const marks=[...d.text.matchAll(re)];
  if(!marks.length)return extractClaims(d).map(c=>({...c,speaker:null,lexicalCues:uncertaintyCues(c.source.quote)}));
  const spans=[];
  if(marks[0].index>0&&d.text.slice(0,marks[0].index).trim())spans.push({a:0,b:marks[0].index,speaker:null});
  marks.forEach((m,i)=>spans.push({a:m.index,b:marks[i+1]?.index??d.text.length,speaker:(m[1]||m[2]).trim()}));
  if(spans.length>500)throw Error('El diálogo excede 500 intervenciones.');
  return spans.map(({a,b,speaker},i)=>{
    while(a<b&&/\s/.test(d.text[a]))a++;while(b>a&&/\s/.test(d.text[b-1]))b--;
    const quote=d.text.slice(a,b),cues=uncertaintyCues(quote);
    return {id:`${d.id}-c${i+1}`,version:1,source:{documentId:d.id,start:a,end:b,quote},speaker,subject:d.subject||null,experiencer:d.subject?'patient':'unknown',entity:null,episode:null,concept:null,value:null,unit:null,polarity:'unknown',modality:'unknown',eventAt:null,eventEnd:null,authoredAt:d.authoredAt,availableAt:d.availableAt,rootIds:[],capture:'ambiguous',uncertainty:null,lexicalCues:cues,review:'pending',reviewNote:'Segmentación por interlocutor. Sin interpretación clínica; indicadores léxicos no adjudicados.'};
  });
}
export function corpusBundle(item,metadata={}){
  if(!item||typeof item.text!=='string'||item.text.length>100000)throw Error('Caso inválido o mayor de 100.000 caracteres.');
  const b=emptyBundle();b.case={id:item.id,title:metadata.title||`Entrega sintética ${item.id}`,synthetic:true};
  b.corpus={...metadata,sourceIndex:item.index,originalOffsets:{start:item.start,end:item.end},annotationStatus:'unannotated',trajectoryId:null};
  const d={id:item.id,title:'Entrega comunicada · H',channel:'handover',text:item.text,subject:null,author:null,authoredAt:null,availableAt:null};
  b.documents=[d];b.claims=dialogueClaims(d);return b;
}
