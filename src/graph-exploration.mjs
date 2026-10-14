/**
 * TRAZA · Obsidian-like local graph projection.
 * This module only decides VISIBILITY. It cannot change documentary claims,
 * temporal cutoffs, provenance or edge direction. MIT.
 * Approach: Quartz local/global depth + Expansive Local Graph branch overrides.
 */
function edgesOf(data) { return Array.isArray(data?.edges) ? data.edges : []; }
function nodesOf(data) { return Array.isArray(data?.nodes) ? data.nodes : []; }
function adjacency(data) {
  const neighbors=new Map(nodesOf(data).map(n=>[n.id,new Set()]));
  for (const e of edgesOf(data)) {
    if(!neighbors.has(e.source)||!neighbors.has(e.target))continue;
    neighbors.get(e.source).add(e.target);
    neighbors.get(e.target).add(e.source);
  }
  return neighbors;
}
function bfs(neighbors,start,depth,limit=Infinity) {
  if(!neighbors.has(start))return new Set();
  const seen=new Set([start]);let frontier=[start];
  for(let level=0;level<depth&&frontier.length;level++) {
    const next=[];
    for(const id of frontier)for(const other of neighbors.get(id))if(!seen.has(other)&&seen.size<limit){seen.add(other);next.push(other);}
    frontier=next;
  }
  return seen;
}
export function expandBranch(expansions={},id,step=1){
  if(!Number.isInteger(step)||step<1||step>4)throw new RangeError('Profundidad de expansión no válida');
  if(typeof id!=='string'||!id.trim())throw new TypeError('ID de rama no válido');
  return {...expansions,[id]:Math.min(4,(expansions[id]??0)+step)};
}
export function collapseBranch(expansions={},id){
  const out={...expansions},next=(out[id]??0)-1;
  if(next>0)out[id]=next;else delete out[id];
  return out;
}
export function graphDegree(data,id){return adjacency(data).get(id)?.size??0;}
export function graphConnections(data,id){return edgesOf(data).filter(e=>e.source===id||e.target===id);}
export function visibleGraph(data,{center=null,global=false,expansions={}}={}){
  const nodes=nodesOf(data),edges=edgesOf(data),byId=new Map(nodes.map(n=>[n.id,n])),neighbors=adjacency(data);
  if(!nodes.length)return {...data,nodes:[],edges:[],combos:[],scope:{global,center:null,hiddenNodes:0,hiddenEdges:0,visibleNodes:0,visibleEdges:0,expandable:{}}};
  const safeCenter=byId.has(center)?center:nodes.find(n=>n.data?.kind==='claim')?.id??nodes[0].id;
  const shown=global?new Set(byId.keys()):bfs(neighbors,safeCenter,1,9);
  if(!global){
    // Iteratively add only branches whose anchor is already visible. An expansion
    // for a formerly visible but currently filtered node never reveals hidden data.
    for(let pass=0;pass<nodes.length;pass++){
      let changed=false;
      for(const [id,level] of Object.entries(expansions||{})){
        if(!shown.has(id)||!Number.isInteger(level)||level<1)continue;
        for(const other of bfs(neighbors,id,Math.min(5,level+(id===safeCenter?1:0)),1+8*(level+(id===safeCenter?1:0))))if(!shown.has(other)){shown.add(other);changed=true;}
      }
      if(!changed)break;
    }
  }
  const visibleNodes=nodes.filter(n=>shown.has(n.id));
  const visibleEdges=edges.filter(e=>shown.has(e.source)&&shown.has(e.target));
  const expandable={};for(const n of visibleNodes)expandable[n.id]=[...neighbors.get(n.id)].filter(id=>!shown.has(id)).length;
  return {...data,nodes:visibleNodes,edges:visibleEdges,combos:[],scope:{global,center:safeCenter,visibleNodes:visibleNodes.length,visibleEdges:visibleEdges.length,hiddenNodes:nodes.length-visibleNodes.length,hiddenEdges:edges.length-visibleEdges.length,expandable}};
}
