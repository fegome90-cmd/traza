/** Tres diálogos completos seleccionados del texto servido por Figshare vía Firecrawl.
 * No son anotaciones publicadas. El archivo binario original no fue descargado/verificado por hash.
 * Conway, Aaron (2026). doi:10.6084/m9.figshare.32658084.v1. CC BY 4.0.
 */
export const FIGSHARE_META={title:'Muestra Figshare · entrega sintética',dataset:'Conway 2026',doi:'10.6084/m9.figshare.32658084.v1',articleDOI:'10.2196/106133',license:'CC BY 4.0',licenseURL:'https://creativecommons.org/licenses/by/4.0/',sourceURL:'https://ndownloader.figshare.com/files/65497158',attribution:'Conway, Aaron (2026). Large Language Models for Structured Information Extraction in Artificial Intelligence-Assisted Clinical Handover: Evaluation Study. Figshare. DOI: 10.6084/m9.figshare.32658084.v1.',retrieval:'Texto servido recuperado con Firecrawl el 13-10-2026; selección de tres diálogos, sin traducción. No copia binaria verificada del archivo completo.',reportedOriginalCount:103,publishedFileCount:1,publishedFilename:'tpch_text_values.md',publishedBytes:184927,publishedMD5:'710e27e24c924b87968543a9f831e5ef',originalCountStatus:'Auditoría aportada por Felipe; no recuento programático del original en esta entrega',annotationStatus:'unannotated'};
export const CORPUS_SAMPLES=[
{id:'FIG-005',index:5,start:null,end:null,title:'Incertidumbre y escalamiento',text:`[NURSE]: Hi Dr. Patel, I need to escalate a concern about Mr. Thomas Nguyen, 74 years old, currently in bed 5 on the urology ward. He’s been deteriorating clinically — I’m not exactly sure what’s triggering it, but I think he needs a medical review soon, possibly urgently.
[DOCTOR]: Okay, what’s going on?
[NURSE]: He was admitted yesterday with acute urinary retention and a history of benign prostatic hyperplasia. A catheter was inserted last night, but over the last few hours he seems to have become more lethargic, tachycardic, and hypotensive. His urine output’s dropped quite a bit — not sure if the catheter’s blocked or if he’s just shutting down.
[DOCTOR]: What are his current vitals?
[NURSE]: BP’s sitting around 88/54, HR about 112, RR 22, SpO₂ 96% on room air, temp 37.9°C. He’s only passed about 40 mL in the last three hours, give or take. His Q‑ADDS is around 7, though I’ll double‑check — it might be 8 depending on the scoring for output.
[DOCTOR]: Any pain or other symptoms?
[NURSE]: He’s got some lower abdominal discomfort — says it’s “tight” more than painful — and a low‑grade fever. He’s a bit confused, which the team on shift earlier didn’t mention, so that’s new. No vomiting that I’ve seen, but he’s refusing fluids and looks a little clammy.
[DOCTOR]: Any recent bloods?
[NURSE]: Yes, this morning’s labs: white cell 14.6, CRP 98, creatinine 168 from 102 yesterday, eGFR down to 44 — sorry, I think it’s 44, not 4, but I can confirm. Looks like he might be heading into an acute kidney injury, possibly secondary to infection, obstruction, or both. Micro hasn’t come back yet, but urine looked cloudy.
[DOCTOR]: Okay, thanks. I’ll come and review him now — give me about ten minutes. We may need imaging and probably to escalate to the surgical team if obstruction’s worsening. I’ll decide once I’ve seen him.
[NURSE]: Alright, I’ll keep an eye on him for now and prepare in case you want to transfer or escalate further.`},
{id:'FIG-007',index:7,start:null,end:null,title:'Comunicación y barreras sensoriales · A',text:`[NURSE]: Hi, I’m handing over Mrs. Lien Tran, 82 years old, here for a renal ultrasound to investigate reduced kidney function. She’s from a Vietnamese-speaking background and does not speak English. She also has significant vision impairment and is deaf.
[RADIOGRAPHER]: Thanks. How does she communicate?
[NURSE]: She uses Vietnamese sign language and gestures. Her daughter is on the way and usually helps interpret. In the meantime, we’ve requested a Vietnamese interpreter, but they haven’t arrived yet. I’ve written out some basic instructions in large print Vietnamese, but she may still need assistance understanding the procedure.
[RADIOGRAPHER]: Is she medically stable?
[NURSE]: Yes, vitals are stable. She’s a bit anxious due to the unfamiliar environment and communication barriers, so a calm approach will help.
[RADIOGRAPHER]: Any mobility issues?
[NURSE]: She’s ambulant with assistance. She uses a walking frame and needs help getting on and off the bed.
[RADIOGRAPHER]: Any allergies or medications?
[NURSE]: No known drug allergies. She’s on Amlodipine 5 mg daily, Furosemide 40 mg daily, Calcium carbonates she’s Nil by mouth for the scan and has had fluids withheld this morning.
[RADIOGRAPHER]: I’ll wait for the interpreter or her daughter before starting. I’ll keep her comfortable in the meantime.
[NURSE]: Perfect. Let me know if you need anything else.`},
{id:'FIG-008',index:8,start:null,end:null,title:'Comunicación y barreras sensoriales · B',text:`[ED_NURSE]: Hi, I’m handing over Mrs. Lien Tran, 82 years old, transferring to your ward for further investigation of renal impairment. She’s here for a renal ultrasound to help diagnose the issue.
[WARD_NURSE]: Thanks. Can you tell me a bit about her background?
[ED_NURSE]: Sure. She’s from a Vietnamese-speaking background, does not speak English, and is deaf. She also has significant vision impairment. Communication is a challenge—she uses Vietnamese sign language and gestures, but we’ve requested a Vietnamese interpreter. Her daughter is on the way and usually helps with communication.
[WARD_NURSE]: How is she medically?
[ED_NURSE]: Her Vitals are stable, She’s alert but anxious due to the unfamiliar environment and communication barriers.
[WARD_NURSE]: Any mobility concerns?
[ED_NURSE]: She’s ambulant with assistance and uses a walking frame. Needs help with transfers and getting on/off the bed.
[WARD_NURSE]: Any medications or allergies?
[ED_NURSE]: No known drug allergies. She’s on, Amlodipine 5 mg daily, Furosemide 40 mg daily, Calcium carbonate, she’s nil by mouth for the scan and fluids have been withheld this morning.
[WARD_NURSE]:  Anything else I should be aware of?
[ED_NURSE]: Just be mindful of her communication needs and vision impairment. I’ve left a large print Vietnamese instruction sheet at the bedside, but she may still need support. Her daughter should arrive shortly and can assist.
[WARD_NURSE]: I’ll get her settled and follow up with the interpreter service.
[ED_NURSE]: Let me know if anything changes.`}
];
