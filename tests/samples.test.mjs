import {test} from 'node:test';import assert from 'node:assert/strict';
import {CORPUS_SAMPLES} from '../src/samples.mjs';
import {corpusBundle,splitCorpus} from '../src/corpus.mjs';
import {validateBundle} from '../src/engine.mjs';
test('D01: muestra contiene tres diálogos y no declara otros casos cargados',()=>assert.equal(CORPUS_SAMPLES.length,3));
test('D02: todos los ejemplos externos pasan esquema sin inventar raíces',()=>{for(const x of CORPUS_SAMPLES){const b=corpusBundle(x);assert.equal(validateBundle(b).ok,true);assert.equal(b.roots.length,0);assert.ok(b.claims.every(c=>c.availableAt===null&&c.subject===null&&c.eventAt===null));}});
test('D03: empaquetar tres textos permite recuento y extracción local sin alterar contenido',()=>{const txt=CORPUS_SAMPLES.map(x=>x.text).join('\n\n---\n\n');const out=splitCorpus(txt);assert.deepEqual(out.map(x=>x.text),CORPUS_SAMPLES.map(x=>x.text));});
