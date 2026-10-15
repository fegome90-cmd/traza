import {MODALITIES,POLARITIES,keyOf,evidenceAge} from './engine.mjs';
export const escapeHTML = v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function fixedDate(iso,minutes=-180){if(!iso)return 'Desconocida';return new Date(Date.parse(iso)+minutes*60000).toISOString().slice(0,16).replace('T',' ');}
export const shortTime=iso=>iso?fixedDate(iso).slice(11):'Sin fecha';
export const toInput=iso=>iso?fixedDate(iso).replace(' ','T'):'';
export const fromInput=v=>v?`${v.length===16?v+':00':v}-03:00`:null;
export function ageLabel(min){if(min===null)return 'Desconocida';if(min<60)return `${Math.round(min)} min`;const h=Math.floor(min/60),m=Math.round(min%60);return `${h} h${m?` ${m} min`:''}`;}
export function markdownReport(bundle,view,context){
  const md=s=>String(s??'Desconocido').replace(/\|/g,'\\|').replace(/\n/g,' ');
  const rows=view.claims.map(c=>`| ${md(keyOf(c))} | ${md(c.source.documentId)} | ${md(c.source.quote)} | ${MODALITIES[c.modality]} | ${POLARITIES[c.polarity]} | ${md(c.eventAt)} | ${md(c.availableAt)} | ${c.rootIds.join(', ')||'Sin raíz declarada'} | ${c.review} |`).join('\n');
  let result=`# TRAZA clínica — vista documental\n\nCaso sintético: ${bundle.case.title}\n\n**No es una determinación del estado real del paciente. No usar para decisiones asistenciales.**\n\n## Contexto de lectura\n\n- Actor declarado: ${context.actor}\n- Tarea: ${context.task}\n- Tiempo clínico t: ${context.clinicalAt||'Sin restricción'}\n- Información disponible hasta κ: ${context.kappa||'Sin corte temporal (archivo; no simula conocimiento pasado)'}\n- Canal: disponibilidad declarada en este expediente de investigación.\n\n## Afirmaciones de la vista\n\n| ID y versión | Fuente | Fragmento exacto | Modalidad | Polaridad | Tiempo afirmado | Disponible desde | Raíces | Revisión |\n|---|---|---|---|---|---|---|---|---|\n${rows}\n\n## Evidencia de origen\n\n`;
  for(const r of view.roots)result+=`- ${r.id}: ${r.source.documentId}, offsets UTF-16 [${r.source.start},${r.source.end}). Evidencia ${r.evidenceAt||'sin fecha'}; disponible ${r.availableAt||'sin fecha'}. Antigüedad al corte κ: ${ageLabel(evidenceAge(r,context.kappa))}. Raíz declarada, no prueba de independencia.\n`;
  result+='\n## Relaciones por revisar\n\n';result+=view.issues.length?view.issues.map(i=>`- ${i.from} → ${i.to}: ${i.message} Regla: ${i.code}.`).join('\n'):'No se detectaron candidatos con estas reglas y este corte. Esto no certifica ausencia de discrepancias.';
  result+='\n\n## Relaciones anotadas\n\n'+(view.relations.map(r=>`- ${r.from} → ${r.to}: ${r.type}. Disponible ${r.availableAt||'sin fecha'}. Fundamento: ${r.note}`).join('\n')||'Sin relaciones anotadas visibles.');
  result+='\n\n## Fuentes originales disponibles\n\n';
  for(const d of view.documents){const runs=d.text.match(/`+/g)||[],fence='`'.repeat(Math.max(3,...runs.map(x=>x.length+1)));result+=`### ${d.id} — ${d.title}\n\n${fence}text\n${d.text}\n${fence}\n\n`;}
  result+='## Fuente conceptual y límites\n\n«Hacia una teoría del estado documental clínico», Método FALP, LaTeX v0.3, 13-10-2026, §§3,5,6,7.2,8.1,9.1,11,15,33. Extracción mediante reglas acotadas y anotación humana; no NLP validado, modelo clínico ni escritura en ficha. Una revisión sólo atesta revisión de la representación.\n';return result;
}
