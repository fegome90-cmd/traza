/** Métricas de adjudicaciones explícitas, nunca de coincidencias léxicas. */
export function validateAdjudication(r){
  if(!r||!['unassessed','preserved','omitted','contradicted','altered','indeterminate'].includes(r.status))return {ok:false,error:'Estado inválido.'};
  if(r.status==='unassessed')return {ok:true};
  if(r.status==='preserved'&&r.uncertainty==='lost')return {ok:false,error:'Conservación total incompatible con incertidumbre eliminada: adjudica alteración o revisa el alcance.'};
  if(!r.key?.trim()||!r.note?.trim())return {ok:false,error:'Declara una unidad semántica y fundamento (sujeto, tiempo y alcance).'};
  if(['preserved','contradicted','altered'].includes(r.status)&&!r.target?.trim())return {ok:false,error:'Selecciona un fragmento del registro para respaldar este juicio.'};
  if(!['not_assessed','preserved','lost','not_applicable'].includes(r.uncertainty))return {ok:false,error:'Juicio de incertidumbre inválido.'};
  return {ok:true};
}
export function comparisonMetrics(rows,recordComplete){
  const buckets=new Map();let pending=0,invalid=0;
  for(const r of rows){if(!validateAdjudication(r).ok)invalid++;if(['unassessed','indeterminate'].includes(r.status)||!r.key?.trim()){pending++;continue;}const k=r.key.trim();if(!buckets.has(k))buckets.set(k,[]);buckets.get(k).push(r);}
  let conflicts=0,omitted=0,contradictions=0,preserved=0,altered=0,uncertaintyLost=0;
  for(const rs of buckets.values()){
    if(new Set(rs.map(r=>r.status)).size>1){conflicts++;continue;}
    const s=rs[0].status;if(s==='omitted')omitted++;if(s==='contradicted')contradictions++;if(s==='preserved')preserved++;if(s==='altered')altered++;
    if(rs.some(r=>r.uncertainty==='lost'))uncertaintyLost++;
  }
  return {units:buckets.size,pending,invalid,conflicts,omitted,contradictions,preserved,altered,uncertaintyLost,loss:recordComplete&&rows.length>0&&!pending&&!conflicts&&!invalid?omitted:null,nonConserved:recordComplete&&rows.length>0&&!pending&&!conflicts&&!invalid?omitted+contradictions+altered:null};
}
