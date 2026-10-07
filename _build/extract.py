"""Extract structured content from the captured Squarespace pages into content.json."""
import json, re, html, os
from bs4 import BeautifulSoup, NavigableString, Comment
CAP='/home/claude/ka/cap'
opt=json.load(open(CAP+'/optmap.json'))
IMAP={}
for line in open(CAP+'/image-map.tsv'):
    u,n=line.rstrip('\n').split('\t'); IMAP[u]=opt.get(n.split('/')[-1])
def img(u):
    if not u: return None
    u=u.split('?')[0]
    if u in IMAP and IMAP[u] and not IMAP[u].startswith('ERR'): return 'assets/img/'+IMAP[u]
    return u  # external (e.g. unsplash)
def soup(fn): return BeautifulSoup(open(f'{CAP}/pages/{fn}.html',encoding='utf-8'),'html.parser')
ALLOWED={'p','h1','h2','h3','h4','a','strong','em','b','i','br','ul','ol','li','blockquote','span'}
def clean_html(node):
    """Return simplified inner HTML of a text block."""
    node=BeautifulSoup(str(node),'html.parser')
    for c in node.find_all(string=lambda t:isinstance(t,Comment)): c.extract()
    for t in node.find_all(True):
        if t.name not in ALLOWED: t.unwrap(); continue
        attrs={}
        if t.name=='a' and t.get('href'):
            attrs['href']=t['href']
            if t.get('target'): attrs['target']='_blank'; attrs['rel']='noopener'
        t.attrs=attrs
    for t in node.find_all('span'): t.unwrap()
    s=str(node).strip()
    s=re.sub(r'<p>\s*</p>','',s)
    return s
def text_blocks(scope):
    out=[]
    for b in scope.select('.sqs-html-content'):
        out.append(clean_html(b.decode_contents()))
    return out
def blocks_in_order(scope):
    """Ordered list of meaningful blocks inside a section."""
    res=[]
    for b in scope.select('.sqs-block'):
        if b.find_parent(class_='sqs-block') : continue
        name=b.get('data-definition-name') or ''
        cls=' '.join(b.get('class',[]))
        if name=='website.components.html' or 'html-block' in cls:
            h=b.select_one('.sqs-html-content')
            if h: res.append({'type':'text','html':clean_html(h.decode_contents())})
        elif name=='website.components.button' or 'button-block' in cls:
            a=b.select_one('a')
            if a: res.append({'type':'button','text':a.get_text(' ',strip=True),'href':a.get('href') or '#','newtab':a.get('target')=='_blank'})
        elif name=='website.components.map':
            d=b.select_one('[data-context]')
            if d:
                j=json.loads(html.unescape(d['data-context'])).get('location',{})
                res.append({'type':'map','addr':(j.get('addressLine1','')+', '+j.get('addressLine2','')).strip(', '),'lat':j.get('mapLat'),'lng':j.get('mapLng'),'zoom':j.get('mapZoom',12)})
        elif name=='website.components.video':
            d=b.select_one('[data-config-video]')
            if d:
                j=json.loads(html.unescape(d['data-config-video']))
                res.append({'type':'video','hls':j['alexandriaUrl'].replace('{variant}','playlist.m3u8'),'poster':j['alexandriaUrl'].replace('{variant}','thumbnail'),'aspect':j.get('aspectRatio',16/9)})
            else:
                ifr=b.select_one('iframe') ; m=re.search(r'(https?://(?:www\.)?(?:youtube\.com|youtu\.be|player\.vimeo\.com)[^"\s&]*)',html.unescape(str(b)))
                if m: res.append({'type':'embed','src':m.group(1)})
        elif name in ('website.components.imageFluid',) or 'image-block' in cls:
            i=b.select_one('img')
            if i: 
                cap=b.select_one('.image-caption, figcaption')
                a=b.select_one('a[href]')
                res.append({'type':'image','src':img(i.get('data-src') or i.get('src')),'alt':i.get('alt',''),'caption':clean_html(cap.decode_contents()) if cap else '','href':a.get('href') if a else None})
        elif name=='website.components.embed' or 'embed-block' in cls:
            from urllib.parse import unquote
            raw=unquote(html.unescape(str(b)))
            m=re.search(r'youtube\.com/embed/([A-Za-z0-9_-]{6,})',raw) or re.search(r'youtube\.com/watch\?v=([A-Za-z0-9_-]{6,})',raw)
            if m: res.append({'type':'embed','src':'https://www.youtube-nocookie.com/embed/'+m.group(1)})
            else:
                v=re.search(r'player\.vimeo\.com/video/(\d+)',raw)
                res.append({'type':'embed','src':('https://player.vimeo.com/video/'+v.group(1)) if v else ''})
        elif 'gallery-block' in cls or 'sqs-block-gallery' in cls:
            ims=[]
            for i in b.select('img'):
                u=img(i.get('data-src') or i.get('src'))
                if u and u not in ims: ims.append(u)
            res.append({'type':'gallery','images':ims})
        elif name=='website.components.horizontalrule' or 'horizontalrule' in cls:
            res.append({'type':'hr'})
        elif name=='website.components.code':
            c=b.select_one('.sqs-code-container') or b
            res.append({'type':'code','html':c.decode_contents()})
        elif name=='website.components.shape':
            pass
        elif name=='website.components.form':
            res.append({'type':'form'})
    return res
def section_bg(sec):
    b=sec.select_one('.section-background img')
    return img(b.get('data-src') or b.get('src')) if b else None
def gallery_imgs(sec):
    ims=[]
    for i in sec.select('img'):
        u=img(i.get('data-src') or i.get('src'))
        if u and u not in ims: ims.append(u)
    return ims
def meta(s):
    md=s.find('meta',attrs={'name':'description'})
    return {'title':s.title.string.strip() if s.title else '','description':md.get('content','') if md else ''}

C={}
# ---------- projects
w=soup('work'); items=[]
cards=w.select('section.cdk-section a[href]')
seen=set()
for a in cards:
    href=a['href']
    if href in seen: continue
    seen.add(href)
    i=a.select_one('img'); t=a.select_one('h1,h2,h3,h4')
    items.append({'href':href,'slug':href.split('/')[-1],'card_title':t.get_text(' ',strip=True) if t else a.get_text(' ',strip=True),'card_img':img(i.get('data-src') or i.get('src')) if i else None})
C['work_intro']=w.select('section.page-section')[0].get_text(' ',strip=True)
C['work_meta']=meta(w)
for it in items:
    p=soup('work__'+it['slug']); it['meta']=meta(p); secs=p.find('main').select('section.page-section')
    it['sections']=[]
    for sec in secs:
        cls=sec.get('class',[])
        if 'gallery-section' in cls:
            it['sections'].append({'kind':'gallery','images':gallery_imgs(sec)})
        else:
            it['sections'].append({'kind':'content','theme':sec.get('data-section-theme',''),'bg':section_bg(sec),'blocks':blocks_in_order(sec)})
C['projects']=items
# ---------- team
t=soup('our-team'); C['team_meta']=meta(t)
sec0=t.select('section.page-section')[0]; C['team_intro']=blocks_in_order(sec0)
team=[]; seen=set()
for a in t.select('section.cdk-section a[href]'):
    if a['href'] in seen: continue
    seen.add(a['href']); i=a.select_one('img'); h=a.select_one('h1,h2,h3,h4')
    slug=a['href'].split('/')[-1]
    b=soup('our-team__'+slug)
    team.append({'href':a['href'],'slug':slug,'name':h.get_text(' ',strip=True) if h else '','card_img':img(i.get('data-src') or i.get('src')) if i else None,'meta':meta(b),
      'blocks':blocks_in_order(b.find('main').select('section.page-section')[0])})
C['team']=team
# ---------- journal
j=soup('field-journal'); C['journal_meta']=meta(j)
posts=[]; seen=set()
for art in j.select('article'):
    a=art.select_one('a[href*="/field-journal/"]')
    if not a or a['href'] in seen: continue
    seen.add(a['href']); i=art.select_one('img'); h=art.select_one('h1,h2,h3')
    ex=art.select_one('.blog-excerpt, .summary-excerpt')
    slug=a['href'].split('/')[-1]; ps=soup('field-journal__'+slug)
    dt=ps.select_one('time'); 
    body=ps.select_one('.blog-item-content, .entry-content') or ps.find('main')
    posts.append({'href':a['href'],'slug':slug,'title':h.get_text(' ',strip=True) if h else '','cover':img(i.get('data-src') or i.get('src')) if i else None,
      'excerpt':clean_html(ex.decode_contents()) if ex else '','date':dt.get_text(strip=True) if dt else '','datetime':dt.get('datetime','') if dt else '','meta':meta(ps),'blocks':blocks_in_order(body)})
C['posts']=posts
# ---------- services code
sv=soup('working-1'); C['services_meta']=meta(sv)
C['services_blocks']=blocks_in_order(sv.find('main'))
# ---------- contact
ct=soup('contact-1'); C['contact_meta']=meta(ct)
C['contact_sections']=[{'bg':section_bg(s),'theme':s.get('data-section-theme',''),'blocks':blocks_in_order(s)} for s in ct.find('main').select('section.page-section')]
# ---------- home
hm=soup('home-1'); C['home_meta']=meta(hm)
C['home_sections']=[{'bg':section_bg(s),'theme':s.get('data-section-theme',''),'cls':' '.join(s.get('class',[])),'blocks':blocks_in_order(s),'text':s.get_text(' ',strip=True)[:3000],'imgs':gallery_imgs(s)} for s in hm.find('main').select('section.page-section')]
json.dump(C,open('/home/claude/ka/content.json','w'),indent=1,ensure_ascii=False)
print('projects',len(items),'team',len(team),'posts',len(posts))
for it in items: print(' ',it['slug'][:30],'|',it['card_title'][:40],'|',[ (s['kind'],len(s.get('blocks',s.get('images',[])))) for s in it['sections']])
for p in posts: print(' post',p['slug'][:30],p['date'],len(p['blocks']),[b['type'] for b in p['blocks']])
for m in team: print(' team',m['name'],[b['type'] for b in m['blocks']])
