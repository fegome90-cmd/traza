/**
 * TRAZA graph-view · compact offline canvas renderer · MIT.
 * Interaction patterns: Quartz local/global graph and Expansive Local Graph
 * branch expansion. This is original Canvas2D code, NOT copied PixiJS/D3
 * and it does not access private Obsidian APIs.
 */
import {layoutVisibleGraph,screenFromWorld,worldFromScreen} from './graph-layout.mjs';
const clamp=(n,min,max)=>Math.min(max,Math.max(min,n));
const color={claim:'#638e86',root:'#4c9b79',document:'#9baabd',candidate:'#bc8c52',contradiction:'#b46362',selected:'#176758',muted:'#92a5a2',text:'#3a514e'};
function fillFor(n){return n.data?.kind==='root'?color.root:n.data?.kind==='document'?color.document:n.data?.warning?color.candidate:color.claim;}
function shorten(text,max=29){const s=String(text??'').replace(/\s+/g,' ').trim();return s.length>max?s.slice(0,max-1)+'…':s;}
function pointToSegment(p,a,b){const dx=b.x-a.x,dy=b.y-a.y,d=dx*dx+dy*dy;if(!d)return Math.hypot(p.x-a.x,p.y-a.y);const t=clamp(((p.x-a.x)*dx+(p.y-a.y)*dy)/d,0,1);return Math.hypot(p.x-a.x-dx*t,p.y-a.y-dy*t);}
export class GraphCanvas {
 constructor(host,{onSelect=()=>{},onExpand=()=>{},onEdge=()=>{},onZoom=()=>{}}={}){
  this.host=host;this.onSelect=onSelect;this.onExpand=onExpand;this.onEdge=onEdge;this.onZoom=onZoom;
  this.canvas=document.createElement('canvas');this.canvas.className='gv-canvas';this.canvas.setAttribute('role','img');this.canvas.setAttribute('aria-label','Grafo local documental con nodos y aristas. Para navegación por teclado use Buscar nodos.');
  this.ctx=this.canvas.getContext('2d');if(!this.ctx)throw Error('Canvas 2D no disponible.');
  this.host.replaceChildren(this.canvas);this.camera={x:0,y:0,z:1};this.size={width:1,height:1};this.positions=new Map();this.data={nodes:[],edges:[]};this.selected=null;this.hover=null;this.points=new Map();this.pointers=new Map();this.pointerDrag=null;this.dead=false;this.first=true;
  this.initEvents();this.resizeObserver=new ResizeObserver(()=>this.resize());this.resizeObserver.observe(host);this.resize();
 }
 resize(){if(this.dead)return;const w=Math.max(1,this.host.clientWidth),h=Math.max(1,this.host.clientHeight),ratio=clamp(window.devicePixelRatio||1,1,2);
  this.size={width:w,height:h};this.canvas.style.width=w+'px';this.canvas.style.height=h+'px';this.canvas.width=Math.round(w*ratio);this.canvas.height=Math.round(h*ratio);this.ctx.setTransform(ratio,0,0,ratio,0,0);if(this.first&&this.data.nodes.length)this.fit();else this.paint();}
 setGraph(data,{selected=null,positions=null,preserve=true}={}){
  this.data=data;this.selected=selected;const old=positions||this.positions;
  this.positions=layoutVisibleGraph(data,{center:selected,previous:old,iterations:data.nodes.length>180?55:100});
  this.first=!preserve||this.first;if(this.first)this.fit();else this.paint();return this.positions;
 }
 setSelected(id){this.selected=id;this.paint();}
 world(p){return worldFromScreen(p,this.camera,this.size);}
 screen(p){return screenFromWorld(p,this.camera,this.size);}
 fit(){if(!this.data.nodes.length)return;const pts=[...this.positions.values()];let minX=Infinity,minY=Infinity,maxX=-Infinity,maxY=-Infinity;for(const p of pts){minX=Math.min(minX,p.x);maxX=Math.max(maxX,p.x);minY=Math.min(minY,p.y);maxY=Math.max(maxY,p.y);}
  this.camera.x=(minX+maxX)/2;this.camera.y=(minY+maxY)/2;const margin=130;
  this.camera.z=clamp(Math.min((this.size.width-margin)/(maxX-minX+70),(this.size.height-margin)/(maxY-minY+70)),.24,1.5);this.first=false;this.paint();this.onZoom(this.camera.z);
 }
 focus(id){const p=this.positions.get(id);if(!p)return;this.camera.x=p.x;this.camera.y=p.y;this.paint();}
 zoomAt(factor,at={x:this.size.width/2,y:this.size.height/2}){const original=this.world(at);this.camera.z=clamp(this.camera.z*factor,.18,4);this.camera.x=original.x-(at.x-this.size.width/2)/this.camera.z;this.camera.y=original.y-(at.y-this.size.height/2)/this.camera.z;this.paint();this.onZoom(this.camera.z);}
 zoom(factor){this.zoomAt(factor);}
 nodeRadius(node){return node.id===this.selected?11:node.data?.kind==='root'?8.5:node.data?.kind==='document'?7.5:8;}
 paint(){if(this.dead||!this.ctx)return;
  const ctx=this.ctx,{width:w,height:h}=this.size;ctx.clearRect(0,0,w,h);ctx.fillStyle='#fbfdfc';ctx.fillRect(0,0,w,h);
  if(!this.data.nodes.length)return;
  const byId=new Map(this.data.nodes.map(n=>[n.id,n]));const points=this.points=new Map();for(const n of this.data.nodes){const p=this.positions.get(n.id);if(p)points.set(n.id,this.screen(p));}
  const neighbors=new Set([this.selected]);for(const e of this.data.edges)if(e.source===this.selected||e.target===this.selected){neighbors.add(e.source);neighbors.add(e.target);}
  // Links are restrained by default: type and direction are available on focus.
  for(const e of this.data.edges){const a=points.get(e.source),b=points.get(e.target);if(!a||!b)continue;
   const emph=(e.source===this.selected||e.target===this.selected)||(e.source===this.hover||e.target===this.hover);
   const type=e.data?.type;ctx.save();ctx.lineWidth=emph?1.9:1.1;ctx.strokeStyle=type==='contradicts'?'rgba(176,98,92,'+(emph?'.78':'.32')+')':e.data?.kind==='candidate'?'rgba(179,137,81,'+(emph?'.75':'.28')+')':`rgba(108,144,135,${emph?'.76':'.32'})`;
   if(e.data?.kind==='candidate'||e.data?.kind==='relation')ctx.setLineDash(emph?[5,4]:[2,5]);
   ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.stroke();ctx.setLineDash([]);
   if(emph){const theta=Math.atan2(b.y-a.y,b.x-a.x),end=10;ctx.fillStyle=ctx.strokeStyle;const x=b.x-Math.cos(theta)*end,y=b.y-Math.sin(theta)*end;ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x-6*Math.cos(theta-.58),y-6*Math.sin(theta-.58));ctx.lineTo(x-6*Math.cos(theta+.58),y-6*Math.sin(theta+.58));ctx.closePath();ctx.fill();}
   ctx.restore();
  }
  const many=this.data.nodes.length>9;
  // Reserve the active node's label before drawing any other label.
  // Prevents overlaps when expanding a compact neighborhood.
  const placed=[];const active=this.data.nodes.find(n=>n.id===this.selected);
  if(active&&points.has(active.id)){const a=points.get(active.id),t=shorten(active.data?.title||active.data?.key,35);ctx.font='600 12px system-ui, sans-serif';const tw=ctx.measureText(t).width+20;placed.push({l:a.x-tw/2,r:a.x+tw/2,t:a.y+22,b:a.y+48,owner:active.id});}
  for(const n of this.data.nodes){const p=points.get(n.id);if(!p)continue;const selected=n.id===this.selected,hovered=n.id===this.hover;
   ctx.save();if(selected||hovered){ctx.beginPath();ctx.arc(p.x,p.y,selected?19:16,0,Math.PI*2);ctx.fillStyle=selected?'rgba(27,112,90,.11)':'rgba(87,127,120,.09)';ctx.fill();}
   ctx.beginPath();ctx.arc(p.x,p.y,this.nodeRadius(n),0,Math.PI*2);ctx.fillStyle=selected?color.selected:fillFor(n);ctx.fill();ctx.lineWidth=selected?2.3:1.2;ctx.strokeStyle='#ffffff';ctx.stroke();
   if(n.data?.review==='pending'||n.data?.warning){ctx.beginPath();ctx.arc(p.x,p.y,selected?14:12,0,Math.PI*2);ctx.strokeStyle='rgba(182,131,65,.72)';ctx.lineWidth=1.1;ctx.stroke();}
   if(selected||hovered||(this.size.width>=550&&(!many||(this.camera.z>1.18&&neighbors.has(n.id))))){
    const text=shorten(n.data?.kind==='root'?`Evidencia ${n.data.key}`:n.data?.kind==='document'?`Fuente ${n.data.key}`:n.data?.title||n.data?.key,selected?35:25);
    ctx.font=(selected?'600 ':'500 ')+(selected?12:11)+'px system-ui, sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';const ty=(selected&&this.size.width<550&&p.y>h-170)?p.y-this.nodeRadius(n)-20:p.y+this.nodeRadius(n)+17;
    const tw=Math.min(236,ctx.measureText(text).width+16);const box={l:p.x-tw/2-5,r:p.x+tw/2+5,t:ty-13,b:ty+14,owner:n.id};
    const clashes=placed.some(a=>a.owner!==n.id&&box.l<a.r&&box.r>a.l&&box.t<a.b&&box.b>a.t);
    if(!selected&&clashes){ctx.restore();continue;}
    if(selected||hovered){ctx.fillStyle='rgba(255,255,255,.94)';ctx.beginPath();ctx.roundRect(p.x-tw/2,ty-10,tw,21,5);ctx.fill();}
    ctx.fillStyle=selected?'#194a40':color.text;ctx.fillText(text,p.x,ty,220);
    placed.push(box);
   }
   ctx.restore();
  }
 }
 locate(p){let best=null,bd=25;for(const [id,pt] of this.points){const d=Math.hypot(pt.x-p.x,pt.y-p.y);if(d<bd){bd=d;best=id;}}return best;}
 edgeAt(p){let best=null,bd=7;for(const e of this.data.edges){const a=this.points.get(e.source),b=this.points.get(e.target);if(!a||!b)continue;const d=pointToSegment(p,a,b);if(d<bd){best=e;bd=d;}}return best;}
 point(evt){const r=this.canvas.getBoundingClientRect();return{x:evt.clientX-r.left,y:evt.clientY-r.top};}
 initEvents(){
  this.canvas.addEventListener('wheel',e=>{e.preventDefault();this.zoomAt(e.deltaY<0?1.12:.89,this.point(e));},{passive:false});
  this.canvas.addEventListener('pointerdown',e=>{
   if(this.dead)return;const p=this.point(e);this.pointers.set(e.pointerId,p);this.canvas.setPointerCapture(e.pointerId);
   if(this.pointers.size===2){const a=[...this.pointers.values()];this.pinchDistance=Math.hypot(a[0].x-a[1].x,a[0].y-a[1].y);this.pointerDrag=null;return;}
   this.pointerDrag={id:this.locate(p),start:p,last:p,moved:false};
  });
  this.canvas.addEventListener('pointermove',e=>{
   if(this.dead)return;const p=this.point(e);if(this.pointers.has(e.pointerId))this.pointers.set(e.pointerId,p);
   if(this.pointers.size===2){const a=[...this.pointers.values()];const d=Math.hypot(a[0].x-a[1].x,a[0].y-a[1].y);if(this.pinchDistance>0)this.zoomAt(d/this.pinchDistance,{x:(a[0].x+a[1].x)/2,y:(a[0].y+a[1].y)/2});this.pinchDistance=d;return;}
   const drag=this.pointerDrag;
   if(drag&&this.pointers.has(e.pointerId)){
    if(Math.hypot(p.x-drag.start.x,p.y-drag.start.y)>5)drag.moved=true;
    if(drag.moved){const dx=(p.x-drag.last.x)/this.camera.z,dy=(p.y-drag.last.y)/this.camera.z;
     if(drag.id&&this.positions.has(drag.id)){const n=this.positions.get(drag.id);n.x+=dx;n.y+=dy;n.pinned=true;}
     else{this.camera.x-=dx;this.camera.y-=dy;}
     this.paint();
    }
    drag.last=p;return;
   }
   const hover=this.locate(p);if(this.hover!==hover){this.hover=hover;this.canvas.style.cursor=hover?'pointer':'grab';this.paint();}
  });
  this.canvas.addEventListener('pointerup',e=>{const p=this.point(e),drag=this.pointerDrag;this.pointers.delete(e.pointerId);
   if(this.pointers.size<2)this.pinchDistance=null;
   if(drag&&!drag.moved){const id=this.locate(p);if(id)this.onSelect(id);else{const edge=this.edgeAt(p);if(edge)this.onEdge(edge);}}
   this.pointerDrag=null;
  });
  this.canvas.addEventListener('pointercancel',e=>{this.pointers.delete(e.pointerId);this.pointerDrag=null;this.pinchDistance=null;});
  this.canvas.addEventListener('dblclick',e=>{const id=this.locate(this.point(e));if(id){e.preventDefault();this.onExpand(id);}});
 }
 png(){return this.canvas.toDataURL('image/png');}
 destroy(){this.dead=true;this.resizeObserver.disconnect();this.host.replaceChildren();this.pointers.clear();}
}
