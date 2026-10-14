import test from 'node:test';
import assert from 'node:assert/strict';
import {visibleGraph,expandBranch,collapseBranch,graphDegree,graphConnections} from '../src/graph-exploration.mjs';
const node = (id)=>({id,data:{key:id,title:id}});
const link = (id,source,target)=>({id,source,target,data:{kind:'relation',type:'supports'}});
const data={nodes:['A','B','C','D','E','Z'].map(node),edges:[link('ab','A','B'),link('bc','B','C'),link('cd','C','D'),link('de','D','E'),link('az','A','Z')],combos:[],warnings:[]};
test('por defecto sólo muestra nodo central y un salto, sin cortar por páginas',()=>{
 const x=visibleGraph(data,{center:'A'});assert.deepEqual(x.nodes.map(n=>n.id).sort(),['A','B','Z']);assert.deepEqual(x.edges.map(e=>e.id).sort(),['ab','az']);assert.equal(x.scope.hiddenNodes,3);
});
test('expandir una rama revela nuevos vecinos pero no toda la red',()=>{
 const a=expandBranch({},'B');const x=visibleGraph(data,{center:'A',expansions:a});assert.deepEqual(x.nodes.map(n=>n.id).sort(),['A','B','C','Z']);assert.equal(graphDegree(x,'B'),2);
 const b=expandBranch(a,'B');const y=visibleGraph(data,{center:'A',expansions:b});assert.deepEqual(y.nodes.map(n=>n.id).sort(),['A','B','C','D','Z']);
});
test('contraer respeta nodos compartidos y vuelve al conjunto base',()=>{
 const a=expandBranch(expandBranch({},'B'),'B');const z=collapseBranch(a,'B');assert.equal(z.B,1);const x=visibleGraph(data,{center:'A',expansions:z});assert.equal(x.nodes.some(n=>n.id==='D'),false); const y=visibleGraph(data,{center:'A',expansions:collapseBranch(z,'B')});assert.deepEqual(y.nodes.map(n=>n.id).sort(),['A','B','Z']);
});
test('global muestra la vista íntegra pero nunca elementos externos al corte',()=>{
 const x=visibleGraph(data,{center:'A',global:true});assert.equal(x.nodes.length,6);assert.equal(x.edges.length,5);assert.equal(x.scope.hiddenEdges,0);
});
test('la selección es navegacional y no invierte las aristas documentales',()=>{
 const x=visibleGraph(data,{center:'A',expansions:expandBranch({},'B')});assert.deepEqual(graphConnections(x,'B').map(e=>[e.source,e.target]),[['A','B'],['B','C']]);assert.deepEqual(data.edges.map(e=>[e.source,e.target]),[['A','B'],['B','C'],['C','D'],['D','E'],['A','Z']]);
});
test('no expande un nodo oculto ni acepta una profundidad no válida',()=>{
 assert.throws(()=>expandBranch({},'B',-1),/profundidad/i);const x=visibleGraph(data,{center:'A',expansions:{D:2}});assert.deepEqual(x.nodes.map(n=>n.id).sort(),['A','B','Z']);
});
test('grafo vacío no inventa nodos ni selección',()=>{
 const x=visibleGraph({nodes:[],edges:[],combos:[],warnings:[]},{center:null});assert.equal(x.nodes.length,0);assert.equal(x.edges.length,0);
});
test('expandir el nodo central profundiza desde su primer salto visible',()=>{
 const x=visibleGraph(data,{center:'A',expansions:expandBranch({},'A')}); assert.deepEqual(x.nodes.map(n=>n.id).sort(),['A','B','C','Z']);
});
test('un documento con muchos fragmentos expande vecinos en lotes y no ensucia el grafo local',()=>{
 const star={nodes:[node('doc'),...Array.from({length:90},(_,i)=>node('C'+String(i).padStart(3,'0')))],edges:Array.from({length:90},(_,i)=>link('e'+i,'doc','C'+String(i).padStart(3,'0'))),combos:[],warnings:[]};
 const start=visibleGraph(star,{center:'C000'});assert.equal(start.nodes.length,2);
 const a=visibleGraph(star,{center:'C000',expansions:expandBranch({},'C000')});assert.ok(a.nodes.length>start.nodes.length&&a.nodes.length<=17,a.nodes.length);
 const b=visibleGraph(star,{center:'C000',expansions:expandBranch(expandBranch({},'C000'),'C000')});assert.ok(b.nodes.length>a.nodes.length&&b.nodes.length<=25,b.nodes.length);
 const all=visibleGraph(star,{center:'C000',global:true});assert.equal(all.nodes.length,91);
});
