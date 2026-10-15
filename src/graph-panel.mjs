/** TRAZA · Graph View compacto, local-first. No modifica el expediente. MIT. */
import {escapeHTML as esc} from './export.mjs';
import {toGraphData,graphSearch} from './graph-data.mjs';
import {expandBranch,collapseBranch,visibleGraph,graphConnections,anchorAfterSelection} from './graph-exploration.mjs';
import {GraphCanvas} from './graph-view.mjs';
const short=(s,n=64)=>{s=String(s||'').replace(/\s+/g,' ').trim();return s.length>n?s.slice(0,n-1)+'…':s;};
export class GraphPanel {
 constructor(host,{view,selected=null,state={},onSelect=()=>{},onOpenSource=()=>{},onOpenDetail=()=>{}}){
  Object.assign(this,{host,view,selected,state,onSelect,onOpenSource,onOpenDetail,dead:false});
  if(typeof state.global!=='boolean')state.global=false;
  if(!state.expansions||typeof state.expansions!=='object')state.expansions={};
  if(typeof state.query!=='string')state.query='';
  if(!(state.positions instanceof Map))state.positions=new Map();
  this.full=toGraphData(view,{groupByDocument:false});
  this.current=this.full.nodes.find(n=>n.data.key===selected)?.id??this.full.nodes.find(n=>n.data.kind==='claim')?.id??this.full.nodes[0]?.id??null;
  this.anchor=this.current;
  this.events=new AbortController();this.mount();
 }
 q(s){return this.host.querySelector(s);}
 mount(){
  this.host.classList.add('gv-obsidian');this.host.innerHTML=`
   <div class="gv-floating-top">
    <div class="gv-view-switch" role="group" aria-label="Alcance de la red"><button type="button" data-cmd="local" aria-pressed="${!this.state.global}">Local</button><button type="button" data-cmd="global" aria-pressed="${this.state.global}">Global</button></div>
    <label class="gv-search"><span class="gv-search-icon" aria-hidden="true">⌕</span><input data-search type="search" autocomplete="off" placeholder="Buscar afirmación…" aria-label="Buscar nodos y fuentes" value="${esc(this.state.query)}"></label>
    <button data-cmd="fit" class="gv-iconbutton" title="Ajustar vista" aria-label="Ajustar vista">⌗</button>
    <button data-cmd="minus" class="gv-iconbutton" title="Alejar" aria-label="Alejar">−</button>
    <button data-cmd="plus" class="gv-iconbutton" title="Acercar" aria-label="Acercar">+</button>
   </div>
   <div class="gv-search-results" data-results hidden role="listbox" aria-label="Resultados de búsqueda"></div>
   <div class="gv-screen" data-screen></div>
   <div class="gv-selected" data-selected role="region" aria-label="Nodo seleccionado" hidden>
    <span class="gv-focus-dot" data-kind></span><div class="gv-selected-text"><strong data-name></strong><span data-subtitle></span></div>
    <div class="gv-selected-actions"><button type="button" data-cmd="expand">Expandir +1</button><button type="button" data-cmd="collapse" hidden>Contraer −1</button><button type="button" data-cmd="source">Ver fuente</button><button type="button" data-cmd="detail">Detalle</button></div>
   </div>
   <div class="gv-bottomline"><span data-stats aria-live="polite"></span><details class="gv-guide"><summary>Tipos de nodos</summary><div><span><i class="claim"></i> Afirmación</span><span><i class="root"></i> Raíz declarada</span><span><i class="document"></i> Texto fuente</span><span><i class="candidate"></i> Por revisar</span><p>La cercanía espacial no demuestra causalidad, concordancia ni vigencia.</p><button type="button" data-cmd="reset">Reiniciar expansiones</button></div></details></div>
   <div class="gv-hint" data-hint hidden role="status"></div>`;
  this.canvas=new GraphCanvas(this.q('[data-screen]'),{onSelect:id=>this.pick(id),onExpand:id=>this.expand(id),onEdge:edge=>this.edgeInfo(edge)});
  this.bind();this.update();this.fillSearch();
 }
 bind(){const signal=this.events.signal;
  this.host.addEventListener('click',e=>{
   const button=e.target.closest('[data-cmd]');if(button&&!button.disabled){const cmd=button.dataset.cmd;
    if(cmd==='local'){this.state.global=false;this.update();this.canvas.fit();}
    else if(cmd==='global'){this.state.global=true;this.update();this.canvas.fit();}
    else if(cmd==='fit')this.canvas.fit();else if(cmd==='plus')this.canvas.zoom(1.2);else if(cmd==='minus')this.canvas.zoom(1/1.2);
    else if(cmd==='expand')this.expand(this.current);else if(cmd==='collapse')this.collapse(this.current);
    else if(cmd==='reset'){this.state.expansions={};this.state.global=false;this.update();this.canvas.fit();}
    else if(cmd==='source')this.onOpenSource();else if(cmd==='detail')this.onOpenDetail();
   }
   const found=e.target.closest('[data-node-find]');if(found){this.goTo(found.dataset.nodeFind);}
  },{signal});
  const search=this.q('[data-search]');search.addEventListener('input',()=>{this.state.query=search.value;this.fillSearch();},{signal});
  search.addEventListener('keydown',e=>{if(e.key==='Enter'){const first=this.q('[data-node-find]');if(first){e.preventDefault();this.goTo(first.dataset.nodeFind);}}if(e.key==='Escape'){this.q('[data-results]').hidden=true;search.blur();}},{signal});
  this.host.addEventListener('keydown',e=>{if(e.key==='Escape'&&e.target!==search){this.q('[data-results]').hidden=true;}},{signal});
 }
 fillSearch(){const q=this.state.query.trim(),box=this.q('[data-results]');if(!box)return;
  if(!q){box.hidden=true;box.replaceChildren();return;}
  const matches=graphSearch(this.full,q).slice(0,12);box.hidden=false;
  box.innerHTML=matches.map(n=>`<button role="option" type="button" data-node-find="${esc(n.id)}"><b>${esc(n.data.key)}</b> <span>${esc(short(n.data.title,42))}</span></button>`).join('')||'<p>Sin coincidencias</p>';
 }
 goTo(id){const n=this.full.nodes.find(n=>n.id===id);if(!n)return;this.state.query='';this.q('[data-search]').value='';this.fillSearch();this.state.global=false;this.state.expansions={};this.anchor=id;this.pick(id,{forceFocus:true});this.canvas.fit();}
 update({preserve=true}={}){
  if(this.dead)return;this.visible=visibleGraph(this.full,{center:this.anchor,global:this.state.global,expansions:this.state.expansions});
  this.state.positions=this.canvas.setGraph(this.visible,{selected:this.current,positions:this.state.positions,preserve});
  this.q('[data-cmd="local"]').setAttribute('aria-pressed',String(!this.state.global));this.q('[data-cmd="global"]').setAttribute('aria-pressed',String(this.state.global));
  const s=this.visible.scope;this.q('[data-stats]').textContent=`${s.visibleNodes} nodos · ${s.visibleEdges} aristas${s.hiddenNodes?` · ${s.hiddenNodes} ocultos`:''} · ${this.state.global?'red global':'vecindad local'}`;
  this.describe();
 }
 describe(){const box=this.q('[data-selected]'),n=this.full.nodes.find(n=>n.id===this.current);
  if(!n||!this.visible.nodes.some(x=>x.id===n.id)){box.hidden=true;return;}
  box.hidden=false;const d=n.data;this.q('[data-name]').textContent=short(d.title,50);this.q('[data-subtitle]').textContent=`${d.key} · ${d.kind==='root'?'evidencia de origen':d.kind==='document'?'documento fuente':d.review==='pending'?'propuesta sin revisar':d.modality||'afirmación'} · ${graphConnections(this.visible,n.id).length} conexiones`;
  this.q('[data-kind]').className='gv-focus-dot '+(d.kind==='root'?'root':d.kind==='document'?'document':d.warning?'candidate':'claim');
  const canExpand=!this.state.global&&this.previewExpansion(n.id)>0;const exp=this.q('[data-cmd="expand"]');exp.hidden=this.state.global||!canExpand;exp.disabled=!canExpand;exp.textContent=canExpand?`Expandir +${this.previewExpansion(n.id)}`:'Sin más vecinos';
  const depth=this.state.expansions[n.id]??0;const collapse=this.q('[data-cmd="collapse"]');collapse.hidden=this.state.global||depth===0;collapse.textContent=`Contraer −1 (${depth})`;
  this.q('[data-cmd="detail"]').hidden=d.kind==='document';
 }
 previewExpansion(id){const after=visibleGraph(this.full,{center:this.anchor,global:false,expansions:expandBranch(this.state.expansions,id)});return after.nodes.length-this.visible.nodes.length;}
 expand(id){if(this.dead||this.state.global||!this.visible.nodes.some(n=>n.id===id))return;
  this.state.expansions=expandBranch(this.state.expansions,id);this.current=id;this.update();this.canvas.setSelected(this.current);
 }
 collapse(id){if(this.dead||this.state.global)return;this.state.expansions=collapseBranch(this.state.expansions,id);this.update();}
 pick(id,{forceFocus=false}={}){const n=this.full.nodes.find(n=>n.id===id);if(!n)return;
  this.current=id;this.anchor=anchorAfterSelection(this.anchor,id,{global:this.state.global,forceFocus});this.canvas.setSelected(id);this.describe();this.onSelect(n.data.key);
 }
 setSelection(key){if(this.dead)return;const n=this.full.nodes.find(n=>n.data.key===key);if(!n)return;
  this.current=n.id;if(!this.visible.nodes.some(x=>x.id===n.id)){this.anchor=n.id;this.state.expansions={};this.state.global=false;this.update();}else{this.canvas.setSelected(this.current);this.describe();}
 }
 edgeInfo(edge){if(this.dead)return;const b=this.q('[data-hint]');b.hidden=false;b.textContent=`${edge.data.label||'Relación'} · ${short(edge.data.note||'Relación documental',150)}`;
  clearTimeout(this.hintTimer);this.hintTimer=setTimeout(()=>{if(!this.dead)b.hidden=true;},6000);
 }
 png(){return Promise.resolve(this.canvas.png());}
 destroy(){if(this.dead)return;this.dead=true;clearTimeout(this.hintTimer);this.events.abort();this.canvas.destroy();this.host.replaceChildren();}
}
