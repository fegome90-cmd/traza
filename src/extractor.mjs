/** Extracción léxica acotada. No modelo entrenado; cada salida requiere revisión. */
export function textSpans(text){
  const spans=[];let start=0;
  const push=end=>{let a=start,b=end;while(a<b&&/\s/.test(text[a]))a++;while(b>a&&/\s/.test(text[b-1]))b--;if(a<b)spans.push({start:a,end:b,quote:text.slice(a,b)});};
  for(let i=0;i<text.length;i++)if(text[i]==='\n'||(/[.!?]/.test(text[i])&&(i===text.length-1||/\s/.test(text[i+1])))){
    // No separar encabezados horarios del enunciado posterior.
    if(text[i]==='.'&&/^\s*\d{1,2}:\d{2}$/.test(text.slice(start,i)))continue;
    push(text[i]==='\n'?i:i+1);start=i+1;
  }
  push(text.length);return spans;
}
export function extractClaims(document){
  if(typeof document.text!=='string'||document.text.length>100000)throw Error('Texto demasiado extenso; máximo 100.000 caracteres.');
  const spans=textSpans(document.text);if(spans.length>500)throw Error('Máximo 500 fragmentos por fuente. Divide el texto.');
  return spans.map((span,index)=>{
    const c={id:`${document.id}-c${index+1}`,version:1,source:{documentId:document.id,...span},subject:document.subject||null,experiencer:document.subject?'patient':'unknown',entity:null,episode:null,concept:null,value:null,unit:null,polarity:'unknown',modality:'unknown',eventAt:null,eventEnd:null,authoredAt:document.authoredAt,availableAt:document.availableAt,rootIds:[],capture:'ambiguous',uncertainty:null,review:'pending',reviewNote:'Propuesta de reglas léxicas; no verificada.'};
    let s=span.quote.replace(/[.!?]+$/,'').trim();
    // La hora sin fecha no se resuelve a la fecha de documentación.
    s=s.replace(/^\d{1,2}:\d{2}[.\s|–-]+/,'');
    let m;
    const device='((?:PICC|CVC|catéter|dispositivo)\\s+[A-Za-z0-9-]+)';
    if((m=s.match(new RegExp(`^${device}\\s+(presente|ausente)$`,'i'))))Object.assign(c,{entity:m[1],concept:'presencia',value:m[2].toLowerCase(),polarity:m[2].toLowerCase()==='ausente'?'negated':'affirmed',modality:'observation',capture:'present'});
    else if((m=s.match(new RegExp(`^Se (?:indica|planifica|solicita) retirar ${device}$`,'i'))))Object.assign(c,{entity:m[1],concept:'presencia',value:'retiro indicado',polarity:'affirmed',modality:'instruction',capture:'present'});
    else if((m=s.match(new RegExp(`^(No )?se retira ${device}$`,'i'))))Object.assign(c,{entity:m[2],concept:m[1]?'retiro':'presencia',value:m[1]?'no realizado':'ausente',polarity:'negated',modality:'action',capture:'present'});
    else if((m=s.match(/^(?:Paciente )?(?:niega|sin) (fiebre|náuseas|dolor|disnea)$/i)))Object.assign(c,{entity:m[1].toLowerCase(),concept:m[1].toLowerCase(),value:'ausente',polarity:'negated',modality:/niega/i.test(s)?'report':'observation',capture:'present'});
    else if((m=s.match(/^No se descarta (infección|fiebre|dolor|disnea)$/i)))Object.assign(c,{entity:m[1].toLowerCase(),concept:m[1].toLowerCase(),value:'posible',polarity:'uncertain',modality:'hypothesis',capture:'present',uncertainty:'No se descarta'});
    else if((m=s.match(/^(Paciente|Madre|Padre|Familiar) refiere (dolor|fiebre|náuseas|disnea)(?: (\d{1,2})\/10)?(?: (en reposo|al movimiento))?$/i))){
      const patient=m[1].toLowerCase()==='paciente';
      if(!m[3]||+m[3]<=10)Object.assign(c,{subject:patient?document.subject||null:`Familiar referido: ${m[1]}`,experiencer:patient?(document.subject?'patient':'unknown'):'relative',entity:[m[2].toLowerCase(),m[4]].filter(Boolean).join(' '),concept:m[2].toLowerCase(),value:m[3]||'presente',unit:m[3]?'escala /10':null,polarity:'affirmed',modality:'report',capture:'present'});
    }
    return c;
  });
}
