from pathlib import Path
ROOT=Path(__file__).resolve().parent

def concat(folder, pattern):
    files=sorted((ROOT/folder).glob(pattern))
    if not files:
        raise SystemExit(f'No modules found in {folder}/{pattern}')
    return ''.join(p.read_text(encoding='utf-8') for p in files)

(ROOT/'script.js').write_text(concat('src/js','*.js'),encoding='utf-8')
(ROOT/'styles.css').write_text(concat('src/styles','*.css'),encoding='utf-8')
print('Synced root compatibility snapshots from source modules.')
