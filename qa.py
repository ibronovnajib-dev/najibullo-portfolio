from __future__ import annotations
from pathlib import Path
from bs4 import BeautifulSoup
import json, re, sys, xml.etree.ElementTree as ET

ROOT = Path(__file__).resolve().parent
TARGET = ROOT if len(sys.argv) == 1 else (ROOT / sys.argv[1]).resolve()
IS_DIST = TARGET.name == 'dist'
FAIL=[]; PASS=[]

def ok(cond: bool, name: str, detail: str=''):
    (PASS if cond else FAIL).append((name,detail))

def read(name: str) -> str:
    return (TARGET/name).read_text(encoding='utf-8')

html = read('index.html')
soup = BeautifulSoup(html,'html.parser')
ids=[x.get('id') for x in soup.find_all(id=True)]
dups=sorted({x for x in ids if ids.count(x)>1})
ok(not dups,'duplicate ids',str(dups))
anchors=[a.get('href') for a in soup.find_all('a',href=True) if a.get('href','').startswith('#') and len(a.get('href',''))>1]
broken=sorted({h for h in anchors if not soup.find(id=h[1:])})
ok(not broken,'internal anchors',str(broken))
refs=set()
for tag,attr in [('img','src'),('script','src'),('link','href')]:
    for el in soup.find_all(tag):
        v=el.get(attr)
        if v and v.startswith('./'):
            refs.add(v[2:].split('?')[0].split('#')[0])
missing=sorted(x for x in refs if not (TARGET/x).exists())
ok(not missing,'local assets',str(missing))

# JSON-LD
jsonld_ok=True
for node in soup.find_all('script',{'type':'application/ld+json'}):
    try: json.loads(node.string or node.get_text())
    except Exception as e: jsonld_ok=False; FAIL.append(('JSON-LD',str(e)))
if jsonld_ok: PASS.append(('JSON-LD','valid'))

# critical content correctness
ust_start=html.find('data-case-view="ustohona"')
taj_start=html.find('data-case-view="tajlife"')
ust=html[ust_start:taj_start] if ust_start>=0 and taj_start>ust_start else ''
ok(bool(ust) and 'case.taj.story' not in ust and 'case.ust.story.difficulties.title' in ust,'Ustohona case content')

i18n=read('i18n.js')
ok('URLSearchParams' in i18n and "get('lang')" in i18n.replace('"',"'"),'language URL handling')
ok('og:locale' in html and 'og:locale:alternate' in html,'Open Graph locales')

# domain consistency
all_text='\n'.join(read(x) for x in ['index.html','config.js','robots.txt','sitemap.xml','site.webmanifest'] if (TARGET/x).exists())
ok('najibulloh.tj' not in all_text,'no stale old domain')
ok('https://najibullo-portfolio.onrender.com' in all_text,'production domain present')

# sitemap / well-known
try:
    ET.parse(TARGET/'sitemap.xml'); xml_ok=True
except Exception as e:
    xml_ok=False; FAIL.append(('sitemap XML',str(e)))
if xml_ok: PASS.append(('sitemap XML','valid'))
sm=read('sitemap.xml')
ok(all(f'?lang={x}' in sm for x in ['en','ru','tg']),'sitemap language URLs')
ok((TARGET/'.well-known/security.txt').exists(),'security.txt')

# no CDN Three dependency; local 3D engine present
combined_js='\n'.join(read(x) for x in ['experience.js','hero-3d.js','script.js'] if (TARGET/x).exists())
ok('cdn.jsdelivr.net' not in combined_js and (TARGET/'hero-3d.js').exists(),'local 3D engine')

# contact/concierge transport
cfg=read('config.js')
ok('formEndpoint' in cfg and 'formsubmit.co/ajax/' in cfg,'contact provider configured')
ok('github.com/ibronovnajib-dev' in cfg,'verified GitHub configured')
ok(re.search(r'telegram:\s*""',cfg) is not None,'unverified Telegram hidden')
ok('fetch(' in read('script.js') and 'concierge.sending' in read('script.js'),'concierge AJAX flow')

# optimized media
ok((TARGET/'assets/hero-mobile.webp').exists(),'mobile hero asset')
ok((TARGET/'assets/og-cover.webp').exists(),'social cover asset')

# CSS sanity
css=read('styles.css')
ok(css.count('{')==css.count('}'),'CSS brace balance',f"{css.count('{')} / {css.count('}')}")
ok('Mobile premium redesign' in css,'mobile premium stylesheet included')
ok('grid-template-columns:1fr 1fr!important' in css and 'hero__media{position:relative' in css,'phone hero mobile-first layout')
ok('env(safe-area-inset-bottom)' in css and 'env(safe-area-inset-top)' in css,'mobile safe-area support')
ok('project-desc{padding-right:0!important' in css,'mobile project text unclipped')

# meta CSP fallback
csp=soup.find('meta',attrs={'http-equiv':'Content-Security-Policy'})
ok(bool(csp) and 'formsubmit.co' in csp.get('content','') and 'cdn.jsdelivr.net' not in csp.get('content',''),'meta CSP fallback')

# accessibility / performance regression checks
imgs=soup.find_all('img')
ok(all(img.has_attr('alt') for img in imgs),'image alt attributes')
ok(all(img.has_attr('width') and img.has_attr('height') for img in imgs),'image intrinsic dimensions')
unlabelled=[]
for b in soup.find_all('button'):
    text=' '.join(b.stripped_strings).strip()
    aria=b.get('aria-label') or b.get('data-i18n-aria')
    if not text and not aria: unlabelled.append(str(b)[:100])
ok(not unlabelled,'icon-only button labels',str(unlabelled))
root_js=read('script.js')
ok("setAttribute('inert','')" in root_js and "removeAttribute('inert')" in root_js,'modal/menu inert management')
ok("duration = 560" in root_js and "portfolio-seen" in root_js,'short returning-aware preloader')
ok('Small scoped MVP / prototype' in read('i18n.js'),'scoped 3–7 day claim')
try:
    testimonials=json.loads((TARGET/'assets/testimonials.json').read_text(encoding='utf-8'))
    verified=testimonials.get('verified',[]) if isinstance(testimonials,dict) else []
    ok(not verified,'no fabricated testimonials','verified list empty; proof-card fallback used')
except Exception as e:
    FAIL.append(('testimonials JSON',str(e)))

if not IS_DIST:
    # snapshots must exactly match maintainable sources
    js=''.join(p.read_text(encoding='utf-8') for p in sorted((ROOT/'src/js').glob('*.js')))
    cs=''.join(p.read_text(encoding='utf-8') for p in sorted((ROOT/'src/styles').glob('*.css')))
    ok((ROOT/'script.js').read_text(encoding='utf-8')==js,'JS snapshot sync')
    ok((ROOT/'styles.css').read_text(encoding='utf-8')==cs,'CSS snapshot sync')
    ry=read('render.yaml')
    ok('python3 build.py' in ry and 'staticPublishPath: dist' in ry,'Render build config')
    ok('Content-Security-Policy' in ry and 'Strict-Transport-Security' in ry,'Render security headers')
else:
    # production output must not contain source/audit/test artifacts
    forbidden=['src','qa.py','tsconfig.json','package.json','FIX10_QA.json','README.md','render.yaml','build.py','sync_snapshots.py']
    present=[x for x in forbidden if (TARGET/x).exists()]
    ok(not present,'clean dist',str(present))

print(f'Target: {TARGET}')
for n,d in PASS: print('PASS',n,('- '+d if d else ''))
for n,d in FAIL: print('FAIL',n,('- '+d if d else ''))
print(f'PASS={len(PASS)} FAIL={len(FAIL)}')
if FAIL: raise SystemExit(1)
