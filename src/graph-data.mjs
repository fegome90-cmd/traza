/**
 * TRAZA · vista documental → grafo interoperable. MIT.
 * Entrada: selectView(bundle, context), nunca el expediente completo.
 * No resuelve identidad, no infiere evidencia y no modifica la fuente narrativa.
 */
import {keyOf,MODALITIES} from './engine.mjs';
export const GRAPH_VERSION='0.3.0';
export const GRAPH_COLORS=Object.freeze({ink:'#1b3038',muted:'#657780',line:'#c8d6d7',claim:'#ffffff',root:'#e9f4ef',document:'#eef2f8',evidence:'#347e68',source:'#8495a5',relation:'#6c78a2',candidate:'#b77a29',contradiction:'#a34942',selection:'#165f4d'});
export const GRAPH_RELATIONS=Object.freeze({derives_from:'deriva de',supports:'apoya',contradicts:'contradice · anotación',corrects:'corrige',supersedes:'sustituye'});
export const graphId=(kind,key)=>JSON.stringify([kind,String(key)]);
export function graphShort(text,max=48){const s=String(text??'').replace(/\s+/gu,' ').trim();return s.length>max?s.slice(0,max-1)+'…':s;}
function graphUnique(items,kind,key){const seen=new Set();for(const x of items){const id=key(x);if(!id||seen.has(id))throw new Error(`ID ${kind} inválido o repetido: ${id}`);seen.add(id);}}

export function toGraphData(view,{groupByDocument=true}={}){
  if(!view||!['claims','roots','documents','relations','issues'].every(k=>Array.isArray(view[k])))throw new TypeError('Se requiere una vista obtenida con selectView.');
  graphUnique(view.claims,'afirmación',keyOf);graphUnique(view.roots,'raíz',r=>r.id);graphUnique(view.documents,'documento',d=>d.id);graphUnique(view.relations,'relación',r=>r.id);
  const nodes=[],edges=[],combos=[],warnings=[];
  const docs=new Map(view.documents.map(d=>[d.id,d])),roots=new Map(view.roots.map(r=>[r.id,r])),claims=new Set(view.claims.map(keyOf));
  const rootIds=new Set(view.claims.flatMap(c=>c.rootIds||[])),counts=new Map(),flags=new Set(view.issues.flatMap(i=>[i.from,i.to]));
  const datum=(kind,key,c,caption)=>({kind,key,caption,
    title:graphShort(kind==='claim'&&c.entity&&c.value?`${c.entity} · ${c.value}`:c.source?.quote??c.title),
    quote:String(c.source?.quote??c.title??''),documentId:c.source?.documentId??c.id,
    modality:kind==='document'?'document':c.modality,polarity:c.polarity??null,review:c.review??null,
    eventAt:c.eventAt??null,evidenceAt:kind==='root'?c.evidenceAt??null:null,availableAt:c.availableAt??null,
    source:c.source?{...c.source}:null,warning:kind==='claim'&&flags.has(key)});
  for(const c of view.claims){
    const key=keyOf(c),doc=c.source?.documentId,known=docs.has(doc);
    if(!known)warnings.push({code:'MISSING_DOCUMENT',id:key,message:'Fuente no incluida en la vista recibida.'});
    if(groupByDocument&&known)counts.set(doc,(counts.get(doc)||0)+1);
    nodes.push({id:graphId('claim',key),...(groupByDocument&&known?{combo:graphId('combo',doc)}:{}),data:datum('claim',key,c,`${key} · ${c.review==='pending'?'sin revisar':MODALITIES[c.modality]||'Sin clasificar'}`)});
  }
  for(const r of view.roots)if(rootIds.has(r.id))nodes.push({id:graphId('root',r.id),data:datum('root','root:'+r.id,r,`${r.id} · raíz declarada`)});
  // Una fuente textual NO se convierte en una observación de origen.
  for(const id of new Set(view.claims.filter(c=>!(c.rootIds||[]).length).map(c=>c.source?.documentId))){const d=docs.get(id);if(d)nodes.push({id:graphId('document',id),data:datum('document','doc:'+id,d,`${id} · fuente, no observación`)});}
  for(const [id,count] of counts)combos.push({id:graphId('combo',id),data:{documentId:id,count,title:`${id} · ${count} afirmación${count===1?'':'es'}`,description:docs.get(id).title}});
  for(const c of view.claims){
    const target=graphId('claim',keyOf(c));
    for(const id of new Set(c.rootIds||[])){
      if(!roots.has(id)){warnings.push({code:'MISSING_ROOT',id:keyOf(c),message:'Raíz referenciada fuera de la vista recibida.'});continue;}
      edges.push({id:graphId('evidence',JSON.stringify([id,keyOf(c)])),source:graphId('root',id),target,data:{kind:'evidence',originalId:id,label:'evidencia declarada',note:'Procedencia declarada, no independencia ni verdad clínica acreditada.',color:GRAPH_COLORS.evidence}});
    }
    if(!(c.rootIds||[]).length&&docs.has(c.source?.documentId))edges.push({id:graphId('source',keyOf(c)),source:graphId('document',c.source.documentId),target,data:{kind:'source',originalId:c.source.documentId,label:'contiene fragmento',note:'Pertenencia textual, no una observación inferida.',color:GRAPH_COLORS.source}});
  }
  const relation=(r,index,candidate=false)=>{
    if(!claims.has(r.from)||!claims.has(r.to)){warnings.push({code:'MISSING_ENDPOINT',id:r.id,message:'Relación no dibujada: un extremo no está en esta vista.'});return;}
    edges.push({id:graphId(candidate?'candidate':'relation',JSON.stringify([r.id,index])),source:graphId('claim',r.from),target:graphId('claim',r.to),data:{kind:candidate?'candidate':'relation',originalId:r.id,type:r.type??r.code,label:candidate?'por revisar':GRAPH_RELATIONS[r.type]||String(r.type),note:String(candidate?r.message:r.note),availableAt:r.availableAt??null,color:candidate?GRAPH_COLORS.candidate:r.type==='contradicts'?GRAPH_COLORS.contradiction:GRAPH_COLORS.relation}});
  };
  view.relations.forEach((r,i)=>relation(r,i));view.issues.forEach((r,i)=>relation(r,i,true));
  return {nodes,edges,combos,warnings};
}
/** Vecindad no dirigida sólo para navegación: no invierte las aristas del modelo. */
export function graphNeighborhood(data,id,degree=1){
  if(!Number.isInteger(degree)||degree<0||degree>3)throw new RangeError('Vecindad entre cero y tres saltos.');
  const valid=new Set(data.nodes.map(n=>n.id));if(!valid.has(id))return new Set();
  const kept=new Set([id]);let frontier=new Set([id]);
  for(let i=0;i<degree;i++){const next=new Set();for(const e of data.edges){if(frontier.has(e.source)&&valid.has(e.target)&&!kept.has(e.target))next.add(e.target);if(frontier.has(e.target)&&valid.has(e.source)&&!kept.has(e.source))next.add(e.source);}next.forEach(n=>kept.add(n));frontier=next;}
  return kept;
}
export function focusGraphData(data,id,degree=1){
  const kept=graphNeighborhood(data,id,degree),nodes=data.nodes.filter(n=>kept.has(n.id)),edges=data.edges.filter(e=>kept.has(e.source)&&kept.has(e.target)),groups=new Set(nodes.map(n=>n.combo));
  const combos=data.combos.filter(c=>groups.has(c.id)).map(c=>{const count=nodes.filter(n=>n.combo===c.id).length;return {...c,data:{...c.data,count,sourceCount:c.data.count,title:`${c.data.documentId} · ${count}/${c.data.count} en subgrafo`}};});
  return {...data,nodes,edges,combos,scope:{degree,hiddenNodes:data.nodes.length-nodes.length,hiddenEdges:data.edges.length-edges.length}};
}
export function graphSearch(data,query){const norm=s=>String(s??'').normalize('NFD').replace(/\p{Diacritic}/gu,'').toLocaleLowerCase('es'),q=norm(query).trim();return q?data.nodes.filter(n=>norm([n.data.key,n.data.quote,n.data.caption,n.data.documentId].join(' ')).includes(q)):data.nodes;}
export function graphSelectionStates(data,id){
  const active=graphNeighborhood(data,id),groups=new Set(data.nodes.filter(n=>active.has(n.id)).map(n=>n.combo)),s=Object.create(null);
  for(const n of data.nodes)s[n.id]=!active.size?[]:n.id===id?['selected']:active.has(n.id)?['neighbor']:['inactive'];
  for(const e of data.edges)s[e.id]=!active.size?[]:e.source===id||e.target===id?['neighbor']:['inactive'];
  for(const c of data.combos)s[c.id]=!active.size||groups.has(c.id)?[]:['inactive'];return s;
}
export const graphSignature=data=>JSON.stringify([data.nodes.map(n=>[n.id,n.combo??null]),data.edges.map(e=>[e.id,e.source,e.target])]);
