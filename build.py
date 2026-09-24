from pathlib import Path
import os, shutil
ROOT=Path(__file__).resolve().parent
OUT=ROOT/'dist'
DEFAULT='https://najibullo-portfolio.onrender.com'
SITE=os.environ.get('SITE_URL',DEFAULT).rstrip('/')
TEXT_FILES=['index.html','404.html','boot.js','config.js','analytics.js','i18n.js','experience.js','hero-3d.js','site.webmanifest','robots.txt','sitemap.xml']
BINARY_FILES=['favicon.svg','favicon-192.png','favicon-512.png','apple-touch-icon.png']

SECURITY_TEMPLATE = '''Contact: mailto:ibronovnajib@gmail.com
Canonical: {site}/.well-known/security.txt
Preferred-Languages: tg, ru, en
'''

def concat_modules(folder, pattern):
    files=sorted((ROOT/folder).glob(pattern))
    if not files: raise SystemExit(f'No source modules found: {folder}/{pattern}')
    return ''.join(p.read_text(encoding='utf-8') for p in files)

if OUT.exists(): shutil.rmtree(OUT)
OUT.mkdir(parents=True)

# Build maintainable module sources into the two browser bundles.
(OUT/'script.js').write_text(concat_modules('src/js','*.js').replace(DEFAULT,SITE),encoding='utf-8')
(OUT/'styles.css').write_text(concat_modules('src/styles','*.css').replace(DEFAULT,SITE),encoding='utf-8')

for name in TEXT_FILES:
    src=ROOT/name
    if not src.exists(): raise SystemExit(f'Missing production file: {name}')
    dst=OUT/name; dst.parent.mkdir(parents=True,exist_ok=True)
    data=src.read_text(encoding='utf-8').replace(DEFAULT,SITE)
    dst.write_text(data,encoding='utf-8')
for name in BINARY_FILES:
    src=ROOT/name
    if not src.exists(): raise SystemExit(f'Missing production file: {name}')
    shutil.copy2(src,OUT/name)

# security.txt is generated at build time so browser uploads that omit hidden
# .well-known directories cannot break production deploys.
security_dst = OUT/'.well-known/security.txt'
security_dst.parent.mkdir(parents=True, exist_ok=True)
security_src = ROOT/'.well-known/security.txt'
if security_src.exists():
    security_data = security_src.read_text(encoding='utf-8').replace(DEFAULT, SITE)
else:
    security_data = SECURITY_TEMPLATE.format(site=SITE)
security_dst.write_text(security_data, encoding='utf-8')
if (ROOT/'assets').exists(): shutil.copytree(ROOT/'assets',OUT/'assets')
print(f'Built {OUT} for {SITE}')
