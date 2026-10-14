import {SCHEMA} from './engine.mjs';
export const demoTime = h=>`2026-10-13T${h}:00-03:00`;
export function emptyBundle(){return {schema:SCHEMA,case:{id:'SINTETICO-01',title:'Expediente de investigación',synthetic:true},documents:[],claims:[],roots:[],relations:[],audit:[]};}
export function demoBundle(){
  const b=emptyBundle();b.case.title='PICC A · continuidad documental';
  const doc=(id,title,text,auth,avail)=>{const d={id,title,text,subject:'SINTETICO-01',author:'Profesional ficticio',authoredAt:demoTime(auth),availableAt:demoTime(avail)};b.documents.push(d);return d;};
  const d1=doc('R01','Valoración inicial','08:00 · Valoración de enfermería\n\nPICC A presente en brazo derecho.\nPaciente refiere dolor 6/10 en reposo.\nNiega náuseas.','08:05','08:05');
  const d2=doc('R02','Indicación de retiro','11:30 · Plan documentado\n\nSe indica retirar PICC A.\nPendiente de ejecución.','11:35','11:35');
  const d3=doc('R03','Acción de retiro','12:00 · Procedimiento\n\nSe retira PICC A.\nProcedimiento consignado como realizado.','13:00','13:05');
  const d4=doc('R04','Registro de continuidad','20:00 · Registro de continuidad\n\nPICC A presente.\n\nLa afirmación se reproduce desde la valoración de las 08:00. No se consigna una nueva observación del dispositivo en esta nota.','20:00','20:05');
  const claim=(id,d,quote,time,patch)=>{const start=d.text.indexOf(quote);const c={id,version:1,source:{documentId:d.id,start,end:start+quote.length,quote},subject:'SINTETICO-01',experiencer:'patient',entity:'PICC A',episode:'PICC-A / episodio 1',concept:'presencia',value:'presente',unit:null,polarity:'affirmed',modality:'observation',eventAt:demoTime(time),eventEnd:null,authoredAt:d.authoredAt,availableAt:d.availableAt,rootIds:[],capture:'present',uncertainty:null,review:'reviewed',reviewNote:'Anotación manual del caso sintético; no dato de paciente.',...patch};b.claims.push(c);return c;};
  const root=(id,c,time)=>{const r={id,subject:c.subject,entity:c.entity,episode:c.episode,concept:c.concept,value:c.value,unit:c.unit,polarity:c.polarity,modality:c.modality,evidenceAt:demoTime(time),availableAt:c.availableAt,source:structuredClone(c.source),provenance:'Origen declarado en la anotación sintética'};b.roots.push(r);c.rootIds=[id];return r;};
  const c1=claim('A01',d1,'PICC A presente en brazo derecho.','08:00',{});root('O01',c1,'08:00');
  const c2=claim('A02',d1,'Paciente refiere dolor 6/10 en reposo.','08:00',{entity:'Dolor en reposo',episode:'Valoración 08:00',concept:'dolor',value:'6',unit:'escala /10',modality:'report'});root('O02',c2,'08:00');
  const c3=claim('A03',d1,'Niega náuseas.','08:00',{entity:'Náuseas',episode:'Valoración 08:00',concept:'náuseas',value:'ausente',polarity:'negated',modality:'report'});root('O03',c3,'08:00');
  claim('A04',d2,'Se indica retirar PICC A.','11:30',{value:'retiro indicado',modality:'instruction'});
  const c5=claim('A05',d3,'Se retira PICC A.','12:00',{value:'ausente',polarity:'negated',modality:'action'});root('O04',c5,'12:00');
  claim('A06',d4,'PICC A presente.','20:00',{rootIds:['O01'],reviewNote:'Copia declarada por el texto fuente; el tiempo de evidencia sigue siendo 08:00.'});
  b.relations.push({id:'L01',from:'A06@1',to:'A01@1',type:'derives_from',availableAt:demoTime('20:05'),note:'El registro R04 declara reproducción desde la valoración de las 08:00. Relación anotada manualmente para el caso sintético.'});
  return b;
}
