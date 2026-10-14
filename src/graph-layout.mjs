/** Dependency-free deterministic force layout for the offline Quartz-inspired viewer. MIT. */
const TAU=2*Math.PI;
function hash(value){let h=2166136261;for(const ch of String(value)){h^=ch.charCodeAt(0);h=Math.imul(h,16777619);}return h>>>0;}
function polar(id,radius=108){const a=(hash(id)%104729)/104729*TAU;return {x:Math.cos(a)*radius,y:Math.sin(a)*radius};}
export function screenFromWorld(p,camera,size){return {x:size.width/2+(p.x-camera.x)*camera.z,y:size.height/2+(p.y-camera.y)*camera.z};}
export function worldFromScreen(p,camera,size){return {x:(p.x-size.width/2)/camera.z+camera.x,y:(p.y-size.height/2)/camera.z+camera.y};}
export function layoutVisibleGraph(data,{center=null,previous=new Map(),iterations=105}={}){
 const nodes=data.nodes||[],edges=data.edges||[];const ids=new Set(nodes.map(n=>n.id));const pos=new Map(),adj=new Map(nodes.map(n=>[n.id,[]]));
 for(const e of edges)if(ids.has(e.source)&&ids.has(e.target)){adj.get(e.source).push(e.target);adj.get(e.target).push(e.source);}
 for(const n of nodes){
  const was=previous.get(n.id);if(was&&Number.isFinite(was.x)&&Number.isFinite(was.y)){pos.set(n.id,{x:was.x,y:was.y,pinned:!!was.pinned});continue;}
  const neighbors=adj.get(n.id),parent=neighbors.find(id=>pos.has(id));
  const p=polar(n.id,85+Math.sqrt(pos.size)*26),a=parent?pos.get(parent):null;
  pos.set(n.id,{x:p.x+(a?.x||0),y:p.y+(a?.y||0),pinned:false});
 }
 if(!nodes.length)return pos;
 const centerPos=pos.get(center);if(centerPos&&!previous.has(center)){centerPos.x=0;centerPos.y=0;}
 const ordered=nodes.map(n=>n.id),n=nodes.length,iters=Math.min(200,Math.max(0,iterations));
 for(let t=0;t<iters;t++){
  const f=new Map(ordered.map(id=>[id,{x:0,y:0}]));
  for(let i=0;i<n;i++)for(let j=i+1;j<n;j++){
   if(n>200&&(i*17+j*13)%3===0)continue;
   const a=pos.get(ordered[i]),b=pos.get(ordered[j]);let dx=a.x-b.x,dy=a.y-b.y,d2=dx*dx+dy*dy;
   if(d2<1){dx=(i+1)*.17;dy=(j+1)*.14;d2=dx*dx+dy*dy;}
   const distance=Math.sqrt(d2),force=(n>100?1500:2500)/(d2+350);
   const fx=dx/distance*force,fy=dy/distance*force;
   f.get(ordered[i]).x+=fx;f.get(ordered[i]).y+=fy;f.get(ordered[j]).x-=fx;f.get(ordered[j]).y-=fy;
  }
  for(const e of edges){const a=pos.get(e.source),b=pos.get(e.target);if(!a||!b)continue;
   let dx=b.x-a.x,dy=b.y-a.y,dist=Math.max(.01,Math.hypot(dx,dy)),target=120;
   const k=(dist-target)*.020;const fx=dx/dist*k,fy=dy/dist*k;
   f.get(e.source).x+=fx;f.get(e.source).y+=fy;f.get(e.target).x-=fx;f.get(e.target).y-=fy;
  }
  const temp=(1-t/Math.max(1,iters))*.88+.15;
  for(const id of ordered){const p=pos.get(id);if(p.pinned)continue;const v=f.get(id);p.x+=Math.max(-18,Math.min(18,v.x-p.x*.002))*temp;p.y+=Math.max(-18,Math.min(18,v.y-p.y*.002))*temp;}
 }
 for(const [id,p] of pos)if(!Number.isFinite(p.x)||!Number.isFinite(p.y))pos.set(id,{...polar(id),pinned:false});
 return pos;
}
