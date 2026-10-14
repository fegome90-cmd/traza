#!/usr/bin/env python3
"""TRAZA v0.3.0 real browser smoke/regression; Canvas2D, no external graph libraries."""
from pathlib import Path
from playwright.sync_api import sync_playwright
import json
import shutil
ROOT=Path(__file__).resolve().parents[1]
OUTPUT=ROOT/'qa'
OUTPUT.mkdir(exist_ok=True)
HTML=(ROOT/'dist/index.html').read_text(encoding='utf-8')
RESULT=[]
def ck(label,ok,extra=''):
 RESULT.append({'check':label,'ok':bool(ok),'extra':extra})
 if not ok: print('FAIL',label,extra)
 else: print('PASS',label)
with sync_playwright() as p:
 exe=shutil.which('chromium') or shutil.which('chromium-browser') or shutil.which('google-chrome')
 browser=p.chromium.launch(headless=True,**({'executable_path':exe} if exe else {}),args=['--no-sandbox','--disable-dev-shm-usage'])
 for viewport,name in [({'width':1440,'height':900},'desktop'),({'width':390,'height':844},'mobile')]:
  page=browser.new_page(viewport=viewport,device_scale_factor=1)
  errors=[];requests=[];page.on('pageerror',lambda err: errors.append(str(err)));page.on('request',lambda req:requests.append(req.url))
  page.set_content(HTML,wait_until='load');page.wait_for_timeout(350)
  ck(name+': título', 'TRAZA' in page.title())
  ck(name+': lienzo real',page.locator('canvas.gv-canvas').count()==1)
  ck(name+': pantalla visible',page.locator('.gv-screen').bounding_box() is not None)
  ck(name+': fuente oculta al inicio',not page.locator('.source-panel').is_visible())
  ck(name+': inspector oculto al inicio',not page.locator('.inspector').is_visible())
  ck(name+': alcance local', page.get_by_role('button',name='Local',exact=True).get_attribute('aria-pressed')=='true')
  pre=page.locator('[data-stats]').inner_text()
  ck(name+': vista con nodos', 'nodos' in pre and 'aristas' in pre, pre)
  before=page.evaluate('''() => document.querySelector('canvas.gv-canvas').toDataURL().length''')
  ck(name+': canvas pintado',before>5000,str(before))
  page.locator('[data-cmd="expand"]').click();page.wait_for_timeout(70)
  post=page.locator('[data-stats]').inner_text()
  ck(name+': expandir modifica alcance',pre!=post,f'{pre} -> {post}')
  page.locator('[data-cmd="source"]').click();page.wait_for_timeout(80)
  ck(name+': abre fuente y cita',page.locator('.source-panel').is_visible() and page.locator('.source-text mark').count()>0)
  page.get_by_role('button',name='Cerrar panel').first.click()
  ck(name+': cierra fuente',not page.locator('.source-panel').is_visible())
  page.locator('[data-cmd="detail"]').click();page.wait_for_timeout(50)
  ck(name+': abre detalle',page.locator('.inspector').is_visible() and page.locator('.inspector-body').inner_text().strip()!='')
  page.get_by_role('button',name='Cerrar panel').last.click()
  ck(name+': cierra detalle',not page.locator('.inspector').is_visible())
  page.get_by_role('button',name='Global',exact=True).click()
  ck(name+': cambia global',page.get_by_role('button',name='Global',exact=True).get_attribute('aria-pressed')=='true')
  ck(name+': global sin ocultos','ocultos' not in page.locator('[data-stats]').inner_text())
  page.get_by_role('button',name='Local',exact=True).click()
  page.get_by_role('searchbox',name='Buscar nodos y fuentes').fill('A01')
  ck(name+': búsqueda',page.locator('[data-node-find]').count()>0)
  page.locator('[data-node-find]').first.click()
  ck(name+': foco desde búsqueda',page.locator('[data-subtitle]').inner_text().startswith('A01'))
  page.screenshot(path=str(OUTPUT/f'graph-{name}.png'),full_page=False)
  ck(name+': no red externa',len(requests)==0,str(requests))
  ck(name+': sin errores runtime',not errors,str(errors))
  page.close()
 # Temporal boundaries and a larger synthetic corpus: same real Canvas renderer.
 page=browser.new_page(viewport={'width':1350,'height':800},accept_downloads=True)
 page.set_content(HTML);page.wait_for_timeout(150)
 expected=[('12:30','2 afirmaciones'),('13:05','3 afirmaciones'),('20:05','4 afirmaciones')]
 for hh,fragment in expected:
  page.locator(f'[data-time="{hh}"]').click();page.wait_for_timeout(60)
  ck('temporal '+hh,fragment in page.locator('.graph-status').inner_text(),page.locator('.graph-status').inner_text())
 with page.expect_download(timeout=8000) as dl:
  page.locator('[data-action="export"]').click();page.locator('[data-action="download-png"]').click()
 ck('PNG del lienzo renderizado',dl.value.suggested_filename.endswith('.png'))
 page.locator('[data-action="close-dialog"]').first.click()
 a=ROOT/'data/ACI-consulta-y-nota.json'
 if not a.is_file():raise AssertionError('Falta fixture ACI en data/ para la prueba de importación')
 page.locator('#bundle-file').set_input_files(str(a));page.wait_for_timeout(120)
 ck('ACI: 96 afirmaciones reales importadas','96 afirmaciones' in page.locator('.graph-status').inner_text())
 local=page.locator('[data-stats]').inner_text()
 ck('ACI: comienza compacto','2 nodos' in local,local)
 page.locator('[data-cmd="expand"]').click();expanded=page.locator('[data-stats]').inner_text()
 visible=int(expanded.split(' nodos')[0]);ck('ACI: expansión acotada a menos de 18 nodos',2<visible<=17,expanded)
 page.get_by_role('button',name='Global',exact=True).click()
 ck('ACI: la vista global contiene 98 nodos','98 nodos' in page.locator('[data-stats]').inner_text())
 page.close()
 browser.close()
(OUTPUT/'browser-results.json').write_text(json.dumps(RESULT,ensure_ascii=False,indent=2))
print('SUMMARY',sum(x['ok'] for x in RESULT),'/',len(RESULT),'passed')
if not all(x['ok'] for x in RESULT):raise SystemExit(1)
