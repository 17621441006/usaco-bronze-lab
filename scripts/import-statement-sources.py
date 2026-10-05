"""Inspect official language choices and frame policies; store URLs, not copied pages."""
import concurrent.futures, datetime, json, re, subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
CACHE = ROOT / '.research-cache' / 'statement-sources'
CACHE.mkdir(parents=True, exist_ok=True)
catalog = json.loads((ROOT / 'data/catalog.json').read_text())

def inspect(problem):
    pid = problem['id']
    url = f'https://usaco.org/index.php?page=viewproblem2&cpid={pid}&lang=en'
    page, headers = CACHE / f'{pid}.html', CACHE / f'{pid}.headers'
    subprocess.run(['curl', '-fsSL', '--retry', '2', '--max-time', '35', '-D', str(headers), url, '-o', str(page)], check=True)
    html = page.read_text()
    select = re.search(r'<select[^>]*id=[\"\']choose-language[\"\'][^>]*>(.*?)</select>', html, re.S)
    if not select or 'probtext-text' not in html:
        raise ValueError(f'{pid}: official statement or language selector missing')
    languages = re.findall(r'<option[^>]*value=[\"\']([^\"\']+)', select.group(1))
    chinese = next((code for code in languages if code.lower() in ['zh', 'zh-cn', 'zh-hans', 'cn']), None)
    h = headers.read_text().lower()
    blocked = bool(re.search(r'x-frame-options:\s*(deny|sameorigin)', h) or re.search(r'frame-ancestors\s+(?:\x27none\x27|\x27self\x27)', h))
    return {'id': pid, 'englishUrl': url, 'chineseUrl': url.replace('lang=en', 'lang='+chinese) if chinese else None, 'languages': languages, 'embedAllowedByHeaders': not blocked}

with concurrent.futures.ThreadPoolExecutor(max_workers=3) as pool:
    problems = list(pool.map(inspect, catalog))
data = {'checkedAt': datetime.datetime.now(datetime.timezone.utc).isoformat(), 'problems': problems}
(ROOT / 'data/statement-sources.json').write_text(json.dumps(data, ensure_ascii=False, indent=2))
print(json.dumps({'checked': len(problems), 'officialChinese': sum(bool(p['chineseUrl']) for p in problems), 'embeddingBlocked': [p['id'] for p in problems if not p['embedAllowedByHeaders']]}))
