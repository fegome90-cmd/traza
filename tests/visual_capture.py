#!/usr/bin/env python3
"""Reproducible screenshots from a real Chromium Canvas2D render (no mock)."""
from pathlib import Path
import shutil
from playwright.sync_api import sync_playwright
ROOT=Path(__file__).resolve().parents[1];html=(ROOT/'dist/index.html').read_text();out=ROOT/'qa';out.mkdir(exist_ok=True)
with sync_playwright() as p:
 exe=shutil.which('chromium') or shutil.which('chromium-browser') or shutil.which('google-chrome')
 browser=p.chromium.launch(headless=True,**({'executable_path':exe} if exe else {}),args=['--no-sandbox','--disable-dev-shm-usage'])
 for name,width,height in [('desktop',1440,900),('mobile',390,844)]:
  page=browser.new_page(viewport={'width':width,'height':height},device_scale_factor=1)
  page.set_content(html);page.wait_for_timeout(230)
  page.screenshot(path=str(out/f'local-{name}.png'))
  expand=page.locator('[data-cmd="expand"]')
  if expand.is_visible() and expand.is_enabled():
   expand.click();page.wait_for_timeout(120);page.screenshot(path=str(out/f'expanded-{name}.png'))
  page.locator('[data-cmd="source"]').click();page.wait_for_timeout(100)
  page.screenshot(path=str(out/f'with-source-{name}.png'))
  page.close()
 browser.close()
