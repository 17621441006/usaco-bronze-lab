"""Import supplied bilingual anthologies without fetching live statements.

Usage: python scripts/import-provided-statements.py anthology.html [...]
Non-US-Open IDs must exist in the catalog; missing content fails the import.
"""
import base64,hashlib,html,json,re,sys
from html.parser import HTMLParser
from pathlib import Path
R=Path(__file__).resolve().parents[1]
IMPORTED_AT='2026-10-27'
class Sections(HTMLParser):
    containers={'div','article','section','h1','h2','h3','h4'}
    def __init__(self,text):
        super().__init__(convert_charrefs=False);self.text=text;self.offsets=[0];self.sections=[];self.stack=[]
        for line in text.splitlines(keepends=True):self.offsets.append(self.offsets[-1]+len(line))
        self.feed(text)
        assert not self.stack,'Unclosed document sections'
    def position_offset(self):
        line,col=self.getpos();return self.offsets[line-1]+col
    def handle_starttag(self,tag,attrs):
        if tag in self.containers:
            start=self.position_offset();self.stack.append(dict(tag=tag,attrs=dict(attrs),start=start,contentStart=start+len(self.get_starttag_text())))
    def handle_endtag(self,tag):
        if tag in self.containers:
            assert self.stack and self.stack[-1]['tag']==tag,('Mismatched section',tag,self.getpos())
            row=self.stack.pop();row.update(contentEnd=self.position_offset(),end=self.position_offset()+len(tag)+3);self.sections.append(row)
def has_class(section,name):return name in section['attrs'].get('class','').split()
class InertHTML(HTMLParser):
    allowed=set('p div span h1 h2 h3 h4 h5 h6 b strong i em u s sub sup br hr pre code ul ol li table thead tbody tr th td blockquote img a'.split())
    drop=set('script style iframe object embed form input button select textarea svg math link meta noscript'.split())
    void={'br','hr','img','input','link','meta'}
    def __init__(self,text):
        super().__init__(convert_charrefs=False);self.out=[];self.blocked=[];self.feed(text)
    def handle_starttag(self,tag,attrs):
        if tag in self.drop:
            if tag not in self.void:self.blocked.append(tag)
            return
        if self.blocked or tag not in self.allowed:return
        attrs=dict(attrs);safe=[]
        if tag=='img':
            src=attrs.get('src','');match=re.fullmatch(r'data:image/(png|jpeg|webp|gif);base64,([A-Za-z0-9+/=\s]+)',src)
            if not match:raise ValueError('Image is not embedded; do not silently lose it')
            payload=base64.b64decode(match[2]);digest=hashlib.sha256(payload).hexdigest();name=f'{digest}.{match[1]}'
            folder=R/'public/statements/assets';folder.mkdir(parents=True,exist_ok=True);(folder/name).write_bytes(payload)
            safe=[('src',f'/statements/assets/{name}'),('alt',attrs.get('alt') or '题面原图'),('loading','lazy')]
        elif tag=='a':
            href=attrs.get('href','')
            if href.startswith(('https://','http://')):safe=[('href',href),('target','_blank'),('rel','noopener noreferrer')]
        elif tag in ('td','th'):
            safe=[(key,attrs[key]) for key in ('colspan','rowspan') if attrs.get(key,'').isdigit()]
        elif tag=='span' and 'prewrap' in attrs.get('class','').split():
            # Early USACO statements are literal text; retain sample/grid spacing.
            safe=[('class','statement-verbatim')]
        self.out.append('<'+tag+''.join(' '+k+'="'+html.escape(v,quote=True)+'"' for k,v in safe)+'>')
    def handle_endtag(self,tag):
        if self.blocked:
            if tag==self.blocked[-1]:self.blocked.pop()
        elif tag in self.allowed and tag not in self.void:self.out.append('</'+tag+'>')
    def handle_data(self,text):
        if not self.blocked:self.out.append(html.escape(text,quote=False))
    def handle_entityref(self,name):
        if not self.blocked:self.out.append('&'+name+';')
    def handle_charref(self,name):
        if not self.blocked:self.out.append('&#'+name+';')
    def result(self):return ''.join(self.out)
def text_only(value):return html.unescape(re.sub('<[^>]+>','',value))
def extract(source):
    text=source.read_text();scan=Sections(text);year=None;contest=None;rows=[]
    for section in sorted(scan.sections,key=lambda x:x['start']):
        if has_class(section,'year'):
            match=re.search(r'20\d\d',text_only(text[section['contentStart']:section['contentEnd']]))
            if match:year=int(match[0])
        if section['tag'].startswith('h') and has_class(section,'contest'):
            contest=text_only(text[section['contentStart']:section['contentEnd']]).strip()
        if not has_class(section,'problem'):continue
        pid=int(section['attrs']['id'].removeprefix('p'))
        inner=sorted((s for s in scan.sections if section['start']<s['start']<section['end']),key=lambda s:s['start'])
        blocks=[s for s in inner if has_class(s,'problem-text')];labels=[s for s in inner if has_class(s,'lang-label')]
        assert len(blocks)==2 and len(labels)==2,(pid,'Missing language')
        heading=next(s for s in inner if has_class(s,'prob-head'))
        title=text_only(text[heading['contentStart']:heading['contentEnd']]).strip()
        metadata=next((s for s in inner if has_class(s,'problem-meta')),None)
        meta=text_only(text[metadata['contentStart']:metadata['contentEnd']]) if metadata else contest or ''
        raw=[text[s['contentStart']:s['contentEnd']] for s in blocks]
        rows.append({'id':pid,'title':re.sub(r'^Problem\s+\d+[.:]\s*','',title),'year':year,'contest':meta,'raw':raw,'translation':'unofficial' if has_class(labels[1],'unofficial') else 'official'})
    return rows

def main(paths):
    assert paths,'Supply at least one anthology'
    catalog={p['id']:p for p in json.loads((R/'data/catalog.json').read_text())}
    for problem in json.loads((R/'data/statement-only-catalog.json').read_text()):
        catalog.setdefault(problem['id'],problem)
    previous=json.loads((R/'data/local-statements.json').read_text());out={};reports=[];sources=[]
    for path in paths:
        source=Path(path);rows=extract(source);included=[];excluded=[]
        for row in rows:
            pid=row['id']
            if re.search(r'US\s*Open',row['contest'],re.I):
                assert pid not in catalog,(pid,'US Open in catalog');excluded.append(pid);continue
            assert pid in catalog,(pid,row['title'],'Non-Open problem absent from catalog')
            assert pid not in map(int,out),(pid,'Duplicate problem')
            p=catalog[pid];assert row['title']==p['title'],(pid,row['title'],p['title'])
            assert row['year']==p['year'],(pid,row['year'],p['year'])
            raw=row['raw'];clean=[InertHTML(v).result() for v in raw]
            for a,b in zip(raw,clean):assert text_only(a)==text_only(b),(pid,'Text changed')
            prev=previous.get(str(pid),{})
            unchanged=all(prev.get(lang)==value for lang,value in zip(['en','zh'],clean))
            out[str(pid)]={'en':clean[0],'zh':clean[1],'source':'USACO','updatedAt':prev.get('updatedAt',IMPORTED_AT) if unchanged else IMPORTED_AT,'translation':row['translation'],'title':p['title'],'year':p['year']}
            included.append(pid);reports.append({'id':pid,'year':p['year'],'translation':row['translation'],'sourceFile':source.name,'englishSha256':hashlib.sha256(raw[0].encode()).hexdigest(),'chineseSha256':hashlib.sha256(raw[1].encode()).hexdigest()})
        sources.append({'sourceFile':source.name,'sourceSha256':hashlib.sha256(source.read_bytes()).hexdigest(),'includedIds':included,'excludedUSOpenIds':excluded})
    assert set(map(int,out))==set(catalog),('Missing catalog statements',sorted(set(catalog)-set(map(int,out))))
    for p in catalog.values():p['statementAvailable']=str(p['id']) in out
    manifest={'importedAt':IMPORTED_AT,'sources':sources,'included':len(out),'excludedUSOpenIds':[pid for s in sources for pid in s['excludedUSOpenIds']],'officialChinese':sum(p['translation']=='official' for p in reports),'unofficialChinese':sum(p['translation']=='unofficial' for p in reports),'years':sorted({p['year'] for p in reports}),'problems':reports}
    (R/'data/local-statements.json').write_text(json.dumps(out,ensure_ascii=False,separators=(',',':'))+'\n')
    (R/'data/catalog.json').write_text(json.dumps(list(catalog.values()),ensure_ascii=False,indent=2)+'\n')
    (R/'data/statement-import-report.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+'\n')
    print(json.dumps({k:v for k,v in manifest.items() if k not in ('problems','sources')},ensure_ascii=False))
if __name__=='__main__':main(sys.argv[1:])
