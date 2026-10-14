/** Core documental. Sin red, efectos secundarios ni inferencias de verdad clínica. */
export const SCHEMA = 'traza-documentary-graph/0.1';
export const MODALITIES = {observation:'Observación documentada',report:'Relato',interpretation:'Interpretación',hypothesis:'Hipótesis',instruction:'Instrucción',action:'Acción documentada',unknown:'Sin clasificar'};
export const POLARITIES = {affirmed:'Afirmada',negated:'Negada',uncertain:'Incierta',unknown:'Desconocida'};
export const LIMITS = {documents:80,claims:1200,roots:1200,relations:2400,text:100000,bytes:4000000,graph:60};
export const keyOf = c => `${c.id}@${c.version}`;
const isText = (x,max=200) => typeof x==='string' && x.length>0 && x.length<=max;
export function validDate(x){
  if(x===null) return true;
  if(typeof x!=='string'||!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,3})?(?:Z|[+-]\d{2}:\d{2})$/.test(x))return false;
  const [yr,mo,day]=x.slice(0,10).split('-').map(Number),h=+x.slice(11,13),m=+x.slice(14,16),s=+x.slice(17,19);
  const off=x.match(/[+-](\d{2}):(\d{2})$/);
  return yr>=1900&&mo>=1&&mo<=12&&day>=1&&day<=new Date(Date.UTC(yr,mo,0)).getUTCDate()&&h<24&&m<60&&s<60&&(!off||(+off[1]<=14&&+off[2]<60&&(+off[1]!==14||+off[2]===0)))&&Number.isFinite(Date.parse(x));
}
const eligible=(date,cutoff)=>cutoff===null || (date!==null && Date.parse(date)<=Date.parse(cutoff));
const sameIdentity=(a,b)=>['subject','entity','episode','concept'].every(k=>isText(a[k])&&a[k]===b[k])&&(a.unit??null)===(b.unit??null);
const sameContent=(a,b)=>['subject','entity','episode','concept','value','polarity'].every(k=>a[k]===b[k])&&(a.unit??null)===(b.unit??null);
const stateModality=c=>['observation','report','action'].includes(c.modality)&&['affirmed','negated'].includes(c.polarity)&&c.value!==null;
export function validateBundle(b){
  const errors=[];const err=s=>{if(errors.length<30)errors.push(s);};
  try{
    if(!b||typeof b!=='object'||Array.isArray(b))return {ok:false,errors:['El expediente debe ser un objeto JSON.']};
    if(b.schema!==SCHEMA)err('Versión de esquema no compatible.');
    if(!b.case||!isText(b.case.id)||!isText(b.case.title)||b.case.synthetic!==true)err('Sólo se admiten expedientes declarados sintéticos.');
    for(const [name,max] of Object.entries({documents:80,claims:1200,roots:1200,relations:2400,audit:4000}))if(!Array.isArray(b[name])||b[name].length>max)err(`Lista ${name} ausente o excede ${max}.`);
    if(errors.length)return {ok:false,errors};
    const docMap=new Map(),rootMap=new Map(),claimMap=new Map();
    const ident=id=>isText(id,120)&&!['__proto__','prototype','constructor'].includes(id);
    const dates=(o,names,id)=>names.forEach(k=>{if(!validDate(o[k]))err(`${id}: fecha ${k} inválida; se requiere ISO con zona o null.`);});
    const later=(a,b,msg)=>{if(a!==null&&b!==null&&Date.parse(a)<Date.parse(b))err(msg);};
    for(const d of b.documents){
      if(!ident(d.id)||docMap.has(d.id))err('Identificador de documento inválido o repetido.');
      if(!isText(d.title,200)||typeof d.text!=='string'||d.text.length>LIMITS.text)err(`${d.id}: título o texto fuera de límites.`);
      if(d.subject!==null&&!isText(d.subject))err(`${d.id}: sujeto inválido.`);
      if(d.author!==null&&!isText(d.author))err(`${d.id}: autor inválido.`);
      dates(d,['authoredAt','availableAt'],d.id);later(d.availableAt,d.authoredAt,`${d.id}: disponibilidad anterior a documentación.`);docMap.set(d.id,d);
    }
    const source=(s,id)=>{
      const d=docMap.get(s?.documentId);
      if(!d||!Number.isInteger(s.start)||!Number.isInteger(s.end)||s.start<0||s.end<=s.start||s.end>d.text.length||s.quote!==d.text.slice(s.start,s.end))err(`${id}: fragmento no coincide exactamente con su fuente.`);
      return d;
    };
    for(const r of b.roots){
      if(!ident(r.id)||rootMap.has(r.id))err('Identificador de raíz inválido o repetido.');
      if(!Object.hasOwn(MODALITIES,r.modality)||!Object.hasOwn(POLARITIES,r.polarity))err(`${r.id}: modalidad o polaridad inválida.`);
      for(const f of ['subject','entity','episode','concept','value'])if(r[f]!==null&&!isText(r[f],500))err(`${r.id}: ${f} inválido.`);
      dates(r,['evidenceAt','availableAt'],r.id);const d=source(r.source,r.id);
      if(d)later(r.availableAt,d.availableAt,`${r.id}: raíz disponible antes que su fuente.`);
      if(['observation','report','action'].includes(r.modality))later(r.availableAt,r.evidenceAt,`${r.id}: evidencia futura respecto de disponibilidad.`);
      rootMap.set(r.id,r);
    }
    const groups=new Map();
    for(const c of b.claims){
      const key=keyOf(c);if(!ident(c.id)||!Number.isInteger(c.version)||c.version<1||claimMap.has(key))err('Identificador/versión de afirmación inválido o repetido.');
      if(!Object.hasOwn(MODALITIES,c.modality)||!Object.hasOwn(POLARITIES,c.polarity))err(`${key}: modalidad o polaridad inválida.`);
      if(!['patient','relative','other','unknown'].includes(c.experiencer)||!['present','missing','ambiguous','not_applicable'].includes(c.capture)||!['pending','reviewed'].includes(c.review))err(`${key}: estado de captura, sujeto o revisión inválido.`);
      for(const f of ['subject','entity','episode','concept','value','unit','uncertainty'])if(c[f]!==null&&!isText(c[f],1000))err(`${key}: ${f} inválido.`);
      if(typeof c.reviewNote!=='string'||c.reviewNote.length>2000)err(`${key}: nota de revisión inválida.`);
      dates(c,['eventAt','eventEnd','authoredAt','availableAt'],key);
      if(c.eventAt===null&&c.eventEnd!==null)err(`${key}: intervalo sin inicio.`);later(c.eventEnd,c.eventAt,`${key}: intervalo invertido.`);
      const d=source(c.source,key);if(d)later(c.availableAt,d.availableAt,`${key}: afirmación disponible antes que su fuente.`);
      if(!Array.isArray(c.rootIds)||c.rootIds.length>30||new Set(c.rootIds).size!==c.rootIds.length)err(`${key}: raíces inválidas o repetidas.`);
      else for(const id of c.rootIds){const r=rootMap.get(id);if(!r)err(`${key}: raíz inexistente ${id}.`);else{if(!sameContent(c,r))err(`${key}: contenido incompatible con la raíz ${id}; declarar otra raíz o retirar el enlace.`);later(c.availableAt,r.availableAt,`${key}: raíz todavía no disponible.`);}}
      claimMap.set(key,c);groups.set(c.id,[...(groups.get(c.id)||[]),c]);
    }
    for(const arr of groups.values()){
      arr.sort((a,b)=>a.version-b.version);
      arr.forEach((c,i)=>{if(c.version!==i+1)err(`${c.id}: cadena de versiones incompleta.`);if(i){later(c.availableAt,arr[i-1].availableAt,`${c.id}: revisión retroactiva.`);if(arr[i-1].availableAt!==null&&c.availableAt===null)err(`${c.id}: la revisión pierde disponibilidad conocida.`);}});
    }
    const relIds=new Set(),deps=new Map();
    for(const r of b.relations){
      if(!ident(r.id)||relIds.has(r.id))err('Relación repetida o sin ID.');relIds.add(r.id);
      if(!['derives_from','supports','contradicts','corrects','supersedes'].includes(r.type)||!isText(r.note,2000))err(`${r.id}: tipo o fundamento inválido.`);
      dates(r,['availableAt'],r.id);const from=claimMap.get(r.from),to=claimMap.get(r.to);
      if(!from||!to||r.from===r.to)err(`${r.id}: extremos de relación inválidos.`);
      if(from)later(r.availableAt,from.availableAt,`${r.id}: extremo aún no disponible.`);if(to)later(r.availableAt,to.availableAt,`${r.id}: extremo aún no disponible.`);
      if(r.type==='derives_from')deps.set(r.from,[...(deps.get(r.from)||[]),r.to]);
    }
    const visiting=new Set(),visited=new Set();
    const visit=n=>{if(visiting.has(n)){err('La cadena de derivación tiene un ciclo.');return;}if(visited.has(n))return;visiting.add(n);for(const m of deps.get(n)||[])visit(m);visiting.delete(n);visited.add(n);};
    for(const n of deps.keys())visit(n);
  }catch{err('Estructura incompleta o tipos incorrectos. El expediente no fue cargado.');}
  return {ok:errors.length===0,errors};
}
/** Edad en minutos de la evidencia, no de la nota. No umbral de caducidad clínica. */
export function evidenceAge(root,at){return root.evidenceAt===null||at===null||Date.parse(root.evidenceAt)>Date.parse(at)?null:(Date.parse(at)-Date.parse(root.evidenceAt))/60000;}
function issuesFor(claims,roots,clinicalAt){
  const result=[],seen=new Set(),rootMap=new Map(roots.map(r=>[r.id,r]));
  const add=(code,a,b,message)=>{const key=`${code}:${[keyOf(a),keyOf(b)].sort().join(':')}`;if(!seen.has(key)){seen.add(key);result.push({id:key,code,from:keyOf(a),to:keyOf(b),message,status:'candidate'});}};
  const pertinent=c=>stateModality(c)&&c.eventAt!==null&&(clinicalAt===null||Date.parse(c.eventAt)<=Date.parse(clinicalAt));
  for(let i=0;i<claims.length;i++)for(let j=i+1;j<claims.length;j++){
    const a=claims[i],b=claims[j];if(a.id===b.id||!pertinent(a)||!pertinent(b)||!sameIdentity(a,b)||a.experiencer!==b.experiencer)continue;
    const aEnd=a.eventEnd||a.eventAt,bEnd=b.eventEnd||b.eventAt;
    const overlap=Date.parse(a.eventAt)<=Date.parse(bEnd)&&Date.parse(b.eventAt)<=Date.parse(aEnd);
    if(overlap&&(a.value!==b.value||a.polarity!==b.polarity))add('SAME_TIME_OPPOSITION',a,b,'Valores opuestos con sujeto, episodio, atributo y tiempos coincidentes. Revisar contexto; no prueba falsedad clínica.');
  }
  for(const c of claims){
    if(!pertinent(c))continue;
    for(const rootId of c.rootIds){const root=rootMap.get(rootId);if(!root||root.evidenceAt===null||Date.parse(root.evidenceAt)>=Date.parse(c.eventAt))continue;
      const after=claims.filter(d=>d.id!==c.id&&pertinent(d)&&sameIdentity(c,d)&&c.experiencer===d.experiencer&&d.rootIds.length>0&&!d.rootIds.includes(rootId)&&Date.parse(d.eventAt)>Date.parse(root.evidenceAt)&&Date.parse(d.eventAt)<=Date.parse(c.eventAt)).sort((a,b)=>Date.parse(b.eventAt)-Date.parse(a.eventAt));
      if(after.length&&(after[0].value!==c.value||after[0].polarity!==c.polarity))add('REUSED_EVIDENCE_AFTER_CHANGE',after[0],c,'Afirmación posterior basada en evidencia antigua; existe un cambio documentado posterior a esa evidencia. Compatibilidad por revisar, no diagnóstico ni orden.');
    }
  }
  return result;
}
/** D(t|kappa): sólo fuentes, versiones, raíces y relaciones disponibles en el canal declarado. */
export function selectView(bundle,context){
  const {kappa,clinicalAt,task='all',includeHistory=false}=context;
  if(!validDate(kappa)||!validDate(clinicalAt))throw Error('Corte temporal inválido.');
  const documents=bundle.documents.filter(d=>eligible(d.availableAt,kappa));const docIds=new Set(documents.map(d=>d.id));
  let claims=bundle.claims.filter(c=>eligible(c.availableAt,kappa)&&docIds.has(c.source.documentId));
  if(!includeHistory){const latest=new Map();for(const c of claims)if(!latest.has(c.id)||latest.get(c.id).version<c.version)latest.set(c.id,c);claims=[...latest.values()];}
  if(task==='devices')claims=claims.filter(c=>c.concept==='presencia'||c.entity?.match(/PICC|catéter|dispositivo|CVC/i));
  if(task==='symptoms')claims=claims.filter(c=>['dolor','fiebre','náuseas','disnea','infección'].includes(c.concept));
  if(task==='plans')claims=claims.filter(c=>['instruction','action'].includes(c.modality));
  claims.sort((a,b)=>(Date.parse(a.availableAt)||0)-(Date.parse(b.availableAt)||0)||keyOf(a).localeCompare(keyOf(b)));
  const keys=new Set(claims.map(keyOf)),rootIds=new Set(claims.flatMap(c=>c.rootIds));
  const roots=bundle.roots.filter(r=>rootIds.has(r.id)&&eligible(r.availableAt,kappa)&&docIds.has(r.source.documentId));
  const relations=bundle.relations.filter(r=>eligible(r.availableAt,kappa)&&keys.has(r.from)&&keys.has(r.to));
  return {documents,claims,roots,relations,issues:issuesFor(claims,roots,clinicalAt)};
}
export function addRevision(bundle,id,expectedVersion,patch,availableAt){
  if(availableAt===null||!validDate(availableAt))throw Error('Declara la disponibilidad de la nueva versión con zona horaria.');
  const all=bundle.claims.filter(c=>c.id===id).sort((a,b)=>b.version-a.version),current=all[0];
  if(!current||current.version!==expectedVersion)throw Error('Versión obsoleta. Abre la última versión antes de revisar.');
  if(current.availableAt!==null&&Date.parse(availableAt)<Date.parse(current.availableAt))throw Error('Una revisión no puede retroceder su disponibilidad.');
  const next=structuredClone(bundle),allowed=['subject','experiencer','entity','episode','concept','value','unit','polarity','modality','eventAt','eventEnd','rootIds','capture','uncertainty','review','reviewNote'];
  const revision={...structuredClone(current),version:current.version+1,availableAt};
  for(const k of allowed)if(Object.hasOwn(patch,k))revision[k]=structuredClone(patch[k]);
  next.claims.push(revision);next.audit.push({type:'revision',claim:id,from:current.version,to:revision.version,availableAt,note:revision.reviewNote});
  const check=validateBundle(next);if(!check.ok)throw Error(check.errors.join('\n'));return next;
}
export function parseBundle(text){
  if(typeof text!=='string'||text.length>LIMITS.bytes)throw Error('JSON demasiado grande (máximo 4 MB).');
  const b=JSON.parse(text,(k,v)=>{if(['__proto__','prototype','constructor'].includes(k))throw Error('Clave JSON no permitida.');return v;});
  const check=validateBundle(b);if(!check.ok)throw Error(check.errors.join('\n'));return b;
}
export function copyPosterior(n,independent=false){if(!Number.isInteger(n)||n<1||n>12)throw Error('Entre 1 y 12 registros.');const lr=4**(independent?n:1);return lr/(1+lr);}
/** Laboratorio aislado: HMM binario didáctico, T=[[.9,.1],[.1,.9]], B=[[.8,.2],[.2,.8]]. */
export function hmmPosterior(records,t,kappa){
  if(!Number.isInteger(t)||t<0||t>40||!Number.isInteger(kappa)||kappa<0)throw Error('Horizonte didáctico inválido.');
  const unique=new Map();for(const r of records){
    if(![0,1].includes(r.value)||!Number.isInteger(r.time)||r.time<0||!Number.isInteger(r.available)||r.available<r.time||!isText(r.root))throw Error('Evidencia didáctica inválida.');
    if(r.available>kappa)continue;
    if(r.time>t)throw Error('Este filtro sólo admite evidencia hasta t; no implementa suavizado futuro.');
    if(unique.has(r.root)){const old=unique.get(r.root);if(old.time!==r.time||old.value!==r.value)throw Error('Raíz incompatible.');}else unique.set(r.root,r);
  }
  let p=.5;for(let step=0;step<=t;step++){if(step)p=.1+.8*p;for(const r of unique.values())if(r.time===step){const yes=r.value===1?.8:.2,no=1-yes;p=p*yes/(p*yes+(1-p)*no);}}return p;
}
