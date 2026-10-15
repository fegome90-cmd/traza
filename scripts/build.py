#!/usr/bin/env python3
"""TRAZA clínica Graph View v0.3.0: HTML standalone, offline/no remote dependencies."""
from pathlib import Path
import hashlib
import re
import argparse
ROOT = Path(__file__).resolve().parents[1]
MODULES=['engine','extractor','fixtures','corpus','samples','comparison','export','graph','graph-data','graph-exploration','graph-layout','graph-view','graph-runtime','graph-panel','app']
def build(output=None):
    parts=[]
    for name in MODULES:
        source=(ROOT/'src'/f'{name}.mjs').read_text(encoding='utf-8')
        source=re.sub(r'^import .*?;\s*$', '', source, flags=re.M)
        source=re.sub(r'\bexport (?=(?:const|function|class|async)\b)', '', source)
        if name=='graph':source='const esc=escapeHTML;\n'+source
        parts.append(f'// MODULE: {name}\n'+source)
    js='globalThis.TRAZA_BUILD={"version":"0.3.0","mode":"offline","renderer":"Canvas2D"};\n(function(){\n"use strict";\n'+'\n'.join(parts)+'\n})();'
    js=re.sub(r'</script',r'<\\/script',js,flags=re.I)
    html=(ROOT/'src/ui/index.html').read_text().replace('/*STYLE*/', (ROOT/'src/ui/styles.css').read_text()+'\n'+(ROOT/'src/ui/graph.css').read_text()).replace('/*SCRIPT*/',js)
    out=output or ROOT/'dist/index.html';out.parent.mkdir(exist_ok=True,parents=True);out.write_text(html,encoding='utf-8')
    print(f'{out} | bytes={out.stat().st_size} | sha256={hashlib.sha256(out.read_bytes()).hexdigest()}')
    return out
if __name__=='__main__':
    ap=argparse.ArgumentParser();ap.add_argument('--output',type=Path);args=ap.parse_args();build(args.output)
