"""Import the supplied bilingual anthology; never fetch live statement pages."""
import base64,hashlib,html,json,re,sys
from html.parser import HTMLParser
from pathlib import Path
R=Path(__file__).resolve().parents[1]
class Sections(HTMLParser):
    def __init__(self,text):
        super().__init__(convert_charrefs=False);self.text=text;self.offsets=[0];self.divs=[];self.stack=[]
        for line in text.splitlines(keepends=True):self.offsets.append(self.offsets[-1]+len(line))
        self.feed(text)
        assert not self.stack,'Unclosed document sections'
    def position_offset(self):
        line,col=self.getpos();return self.offsets[line-1]+col
    def handle_starttag(self,tag,attrs):
        if tag=='div':
            start=self.position_offset();self.stack.append(dict(attrs=dict(attrs),start=start,contentStart=start+len(self.get_starttag_text())))
    def handle_endtag(self,tag):
        if tag=='div' and self.stack:
            row=self.stack.pop();row.update(contentEnd=self.position_offset(),end=self.position_offset()+6);self.divs.append(row)
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
source=Path(sys.argv[1]);text=source.read_text();scan=Sections(text)
catalog={p['id']:p for p in json.loads((R/'data/catalog.json').read_text())};out={};skipped=[];report=[]
for section in sorted(scan.divs,key=lambda x:x['start']):
    if section['attrs'].get('class')!='problem':continue
    pid=int(section['attrs']['id'].removeprefix('p'))
    if pid not in catalog:skipped.append(pid);continue
    inner=sorted((s for s in scan.divs if section['start']<s['start']<section['end']),key=lambda s:s['start'])
    blocks=[s for s in inner if s['attrs'].get('class')=='problem-text'];labels=[s for s in inner if s['attrs'].get('class','').startswith('lang-label')]
    assert len(blocks)==2 and len(labels)==2,(pid,'Missing language')
    heading=next(s for s in inner if s['attrs'].get('class')=='prob-head')
    title=text_only(text[heading['contentStart']:heading['contentEnd']]).strip()
    assert title.endswith(catalog[pid]['title']),(pid,title,catalog[pid]['title'])
    raw=[text[s['contentStart']:s['contentEnd']] for s in blocks]
    clean=[InertHTML(v).result() for v in raw]
    for a,b in zip(raw,clean):assert text_only(a)==text_only(b),(pid,'Text changed')
    translation='unofficial' if 'unofficial' in labels[1]['attrs'].get('class','') else 'official'
    out[str(pid)]={'en':clean[0],'zh':clean[1],'source':'USACO','updatedAt':'2026-10-04','translation':translation,'title':catalog[pid]['title'],'year':catalog[pid]['year']}
    report.append({'id':pid,'year':catalog[pid]['year'],'translation':translation,'englishSha256':hashlib.sha256(raw[0].encode()).hexdigest(),'chineseSha256':hashlib.sha256(raw[1].encode()).hexdigest()})
assert set(map(int,out))=={pid for pid,p in catalog.items() if p['year']>=2020}
assert len(out)==60 and len(skipped)==18
(R/'data/local-statements.json').write_text(json.dumps(out,ensure_ascii=False,separators=(',',':'))+'\n')
manifest={'sourceFile':source.name,'sourceSha256':hashlib.sha256(source.read_bytes()).hexdigest(),'importedAt':'2026-10-04','included':len(out),'excludedUSOpenIds':skipped,'officialChinese':sum(p['translation']=='official' for p in report),'unofficialChinese':sum(p['translation']=='unofficial' for p in report),'years':sorted({p['year'] for p in report}),'problems':report}
(R/'data/statement-import-report.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+'\n')
print(json.dumps({k:v for k,v in manifest.items() if k!='problems'},ensure_ascii=False))
