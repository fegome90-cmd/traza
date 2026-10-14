#!/usr/bin/env python3
"""Comprueba integridad del paquete publicable desde MANIFEST.sha256.json."""
from pathlib import Path
import hashlib, json, sys
root=Path(__file__).resolve().parents[1]
manifest=json.loads((root/'MANIFEST.sha256.json').read_text('utf-8'))
failures=[]
for relative, record in manifest.items():
    path=root/relative
    if not path.is_file():
        failures.append(f'FALTA: {relative}')
        continue
    content=path.read_bytes()
    if len(content)!=record['bytes'] or hashlib.sha256(content).hexdigest()!=record['sha256']:
        failures.append(f'CAMBIO: {relative}')
current={str(p.relative_to(root)) for p in root.rglob('*') if p.is_file() and '.git' not in p.parts and p.name!='MANIFEST.sha256.json'}
not_listed=current-set(manifest)
for missing in sorted(not_listed): failures.append(f'SIN REGISTRAR: {missing}')
if failures:
    print('\n'.join(failures),file=sys.stderr)
    sys.exit(1)
print(f'OK: {len(manifest)} archivos con bytes y SHA-256 correctos.')
