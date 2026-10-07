"""Generate the Knighton Architecture static site from content.json.

Run:  python3 tools/build.py
Output goes to ./site. Every page is plain HTML. After this first
generation the HTML files can be edited directly; the script is kept so
the whole site can be regenerated from the captured content if needed.
"""
import json, os, re, html, posixpath
from urllib.parse import quote

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SITE = os.path.join(ROOT, 'site')
C = json.load(open(os.path.join(ROOT, 'content.json')))
CAP = os.path.join(ROOT, 'cap')

# Squarespace image URL -> local file (used to rewrite custom-code blocks)
OPT = json.load(open(os.path.join(CAP, 'optmap.json')))
IMAP = {}
for line in open(os.path.join(CAP, 'image-map.tsv')):
    u, n = line.rstrip('\n').split('\t')
    IMAP[u] = OPT.get(n.split('/')[-1])

ANNOUNCE = ('Visit our new Middle Housing Typology site!', 'https://theunderstorycollection.com/')
NAV = [('Who We Are', 'our-team.html'), ('Our Services', 'working-1.html'),
       ('Featured Work', 'work.html'), ('Field Journal', 'field-journal.html')]
CTA = ('Begin now', 'contact-1.html')
PHONE = '+1 (801) 592-1582'
EMAIL = 'info@knightonarchitecture.com'
ADDRESS = '55 N University Ave Suite 227, Provo, UT 84601'
SOCIAL = [
    ('Instagram', 'https://www.instagram.com/knightonarchitecture/', '<path d="M12 2.2c3.2 0 3.6 0 4.8.1 3.3.1 4.8 1.7 4.9 4.9.1 1.3.1 1.6.1 4.8s0 3.6-.1 4.8c-.1 3.2-1.7 4.8-4.9 4.9-1.3.1-1.6.1-4.8.1s-3.6 0-4.8-.1c-3.3-.1-4.8-1.7-4.9-4.9C2.2 15.6 2.2 15.2 2.2 12s0-3.6.1-4.8C2.4 3.9 3.9 2.4 7.2 2.3 8.4 2.2 8.8 2.2 12 2.2zM12 0C8.7 0 8.3 0 7.1.1 2.7.3.3 2.7.1 7.1 0 8.3 0 8.7 0 12s0 3.7.1 4.9c.2 4.4 2.6 6.8 7 7 1.2.1 1.6.1 4.9.1s3.7 0 4.9-.1c4.4-.2 6.8-2.6 7-7 .1-1.2.1-1.6.1-4.9s0-3.7-.1-4.9c-.2-4.4-2.6-6.8-7-7C15.7 0 15.3 0 12 0zm0 5.8a6.2 6.2 0 100 12.4 6.2 6.2 0 000-12.4zM12 16a4 4 0 110-8 4 4 0 010 8zm6.4-11.8a1.4 1.4 0 100 2.9 1.4 1.4 0 000-2.9z"/>'),
    ('LinkedIn', 'https://www.linkedin.com/company/knightonarchitecture/', '<path d="M4.98 3.5a2.5 2.5 0 11-.02 5 2.5 2.5 0 01.02-5zM3 9h4v12H3zM9 9h3.8v1.7h.1c.5-1 1.8-2 3.8-2 4 0 4.8 2.7 4.8 6.1V21h-4v-5.5c0-1.3 0-3-1.8-3s-2.1 1.4-2.1 2.9V21H9z"/>'),
    ('YouTube', 'https://www.youtube.com/@knightonarchitecture', '<path d="M23.5 6.2a3 3 0 00-2.1-2.1C19.5 3.6 12 3.6 12 3.6s-7.5 0-9.4.5A3 3 0 00.5 6.2 31 31 0 000 12a31 31 0 00.5 5.8 3 3 0 002.1 2.1c1.9.5 9.4.5 9.4.5s7.5 0 9.4-.5a3 3 0 002.1-2.1A31 31 0 0024 12a31 31 0 00-.5-5.8zM9.6 15.6V8.4l6.3 3.6z"/>'),
    ('Facebook', 'https://www.facebook.com/knightonarchitecture/', '<path d="M24 12a12 12 0 10-13.9 11.9v-8.4h-3V12h3V9.4c0-3 1.8-4.7 4.5-4.7 1.3 0 2.7.2 2.7.2v3h-1.5c-1.5 0-2 .9-2 1.9V12h3.4l-.5 3.5h-2.9v8.4A12 12 0 0024 12z"/>'),
]
FONTS = ('<link rel="preconnect" href="https://fonts.googleapis.com">'
         '<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>'
         '<link href="https://fonts.googleapis.com/css2?family=Barlow+Semi+Condensed:wght@500;600;700&family=Questrial&family=Saira+Semi+Condensed:wght@500;700&display=swap" rel="stylesheet">')

esc = html.escape


def rel(frm, to):
    """Relative link from page `frm` (e.g. 'work/x.html') to `to` (site-root path)."""
    if to.startswith(('http:', 'https:', 'mailto:', 'tel:', '#', '//')):
        return to
    return posixpath.relpath(to, posixpath.dirname(frm) or '.')


def asset(frm, path):
    if not path:
        return ''
    return rel(frm, path) if not path.startswith('http') else path


def fix_links(frm, s):
    """Rewrite Squarespace-relative links/images inside rich text."""
    def repl_href(m):
        h = m.group(1)
        return 'href="%s"' % esc(rel(frm, map_url(h)), quote=True)
    s = re.sub(r'href="([^"]*)"', repl_href, s)
    s = re.sub(r'src="(assets/[^"]*)"', lambda m: 'src="%s"' % rel(frm, m.group(1)), s)
    return s


def map_url(h):
    """Map an old site URL to the new file path (root-relative, no leading slash)."""
    h = html.unescape(h)
    if h.startswith(('mailto:', 'tel:', '#')):
        return h
    m = re.match(r'https?://(www\.)?knightonarchitecture\.com(/.*)?$', h)
    if m:
        h = m.group(2) or '/'
    if h.startswith('http') or h.startswith('//'):
        return h
    path = h.split('?')[0].split('#')[0].strip('/')
    if path in ('', 'home', 'home-1', 'home-1-1'):
        return 'index.html'
    return path + '.html'


def head(frm, meta, extra=''):
    title = meta.get('title') or 'Knighton Architecture'
    desc = meta.get('description') or ''
    return f'''<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{esc(title)}</title>
<meta name="description" content="{esc(desc, quote=True)}">
<meta property="og:title" content="{esc(title, quote=True)}">
<meta property="og:description" content="{esc(desc, quote=True)}">
<link rel="icon" type="image/png" href="{rel(frm, 'assets/brand/favicon.png')}">
{FONTS}
<link rel="stylesheet" href="{rel(frm, 'assets/css/site.css')}">
{extra}
</head>
<body>
<a class="skip-link" href="#main">Skip to content</a>
'''


def header(frm, active=None, announce=True, dark=False):
    links = []
    for label, href in NAV:
        cur = ' aria-current="page"' if href == active else ''
        links.append(f'<a href="{rel(frm, href)}"{cur}>{label}</a>')
    links.append(f'<a class="btn" href="{rel(frm, CTA[1])}">{CTA[0]}</a>')
    ann = ''
    if announce:
        ann = (f'<div class="announce"><a href="{ANNOUNCE[1]}" target="_blank" rel="noopener">{ANNOUNCE[0]}</a>'
               '<button class="announce__close" aria-label="Close announcement">&times;</button></div>\n')
    return f'''{ann}<header class="site-header{' header--dark' if dark else ''}">
  <div class="site-header__inner">
    <a class="site-header__logo" href="{rel(frm, 'index.html')}" aria-label="Knighton Architecture home">
      <img src="{rel(frm, 'assets/brand/ka-logo-header.png')}" alt="Knighton Architecture + Planning" width="160" height="46">
    </a>
    <button class="nav-toggle" aria-label="Menu" aria-expanded="false"><span></span><span></span><span></span></button>
    <nav class="site-nav" aria-label="Main">{''.join(links)}</nav>
  </div>
</header>
<main id="main">
'''


def footer(frm, scripts=''):
    soc = ''.join(f'<a href="{u}" target="_blank" rel="noopener" aria-label="{n}"><svg viewBox="0 0 24 24" aria-hidden="true">{p}</svg></a>' for n, u, p in SOCIAL)
    return f'''</main>
<footer class="site-footer">
  <div class="wrap site-footer__inner">
    <div class="footer-group">
      <span class="footer-label">CONTACTS</span>
      <div class="footer-contact">
        <p>{ADDRESS}</p>
        <p><a href="mailto:{EMAIL}">{EMAIL}</a></p>
        <p><a href="tel:+18015921582">{PHONE}</a></p>
      </div>
    </div>
    <a class="footer-logo" href="{rel(frm, 'index.html')}" aria-label="Home"><img src="{rel(frm, 'assets/brand/ka-shield-white.png')}" alt="Knighton Architecture shield"></a>
    <div class="footer-group footer-group--right">
      <span class="footer-label">SOCIALS</span>
      <div class="socials">{soc}</div>
    </div>
  </div>
</footer>
<script src="{rel(frm, 'assets/js/site.js')}" defer></script>
{scripts}
</body>
</html>
'''


def write(path, s):
    full = os.path.join(SITE, path)
    os.makedirs(os.path.dirname(full), exist_ok=True)
    open(full, 'w', encoding='utf-8').write(s)


def img_tag(frm, src, alt='', cls='', lazy=True):
    if not src:
        return ''
    c = f' class="{cls}"' if cls else ''
    lz = ' loading="lazy"' if lazy else ''
    return f'<img{c} src="{esc(asset(frm, src), quote=True)}" alt="{esc(alt, quote=True)}"{lz}>'


def map_iframe(b):
    q = quote(b.get('addr') or f"{b.get('lat')},{b.get('lng')}")
    z = int(b.get('zoom') or 12)
    return f'<iframe class="map-frame" loading="lazy" title="Map: {esc(b.get("addr",""), quote=True)}" src="https://maps.google.com/maps?q={q}&amp;z={z}&amp;output=embed"></iframe>'


def video_tag(b, cls='', autoplay=False):
    attrs = 'autoplay muted loop playsinline' if autoplay else 'controls playsinline preload="none"'
    return f'<video class="{cls}" {attrs} data-hls="{b["hls"]}" poster="{b["poster"]}"></video>'


def slideshow(frm, images):
    imgs = ''.join(img_tag(frm, u, '') for u in images)
    return f'''<section class="slideshow" data-lightbox>
  <button class="slideshow__btn slideshow__btn--prev" aria-label="Previous images">&#8249;</button>
  <div class="slideshow__track">{imgs}</div>
  <button class="slideshow__btn slideshow__btn--next" aria-label="Next images">&#8250;</button>
</section>
'''


def dedupe_imgs(images):
    """Squarespace galleries sometimes list the same photo twice under different
    asset IDs; keep the first copy of each filename."""
    out, seen = [], set()
    for u in images:
        key = re.sub(r'^.*/[0-9a-f]{8}_', '', u)
        if key in seen:
            continue
        seen.add(key)
        out.append(u)
    return out


THEME = {'black': 'section--dark', 'dark': 'section--dark', 'dark-bold': 'section--gray',
         'black-bold': 'section--dark', 'white': 'section--white', 'light': 'section--light',
         'bright': 'section--green', '': 'section--light'}

WAVES = '''<svg class="waves" viewBox="0 0 1440 600" preserveAspectRatio="none" aria-hidden="true">
<path d="M0 50 C 250 80, 420 220, 470 600 L0 600Z" fill="#9db086"/>
<path d="M0 190 C 160 260, 300 380, 330 600 L0 600Z" fill="#aebf99"/>
<path d="M0 330 C 70 380, 120 470, 140 600 L0 600Z" fill="#bfcdb0"/>
<path d="M1440 200 C 1300 250, 1210 330, 1210 600 L1440 600Z" fill="#9db086"/>
</svg>'''

# ---------------------------------------------------------------- HOME
def build_home():
    f = 'index.html'
    hs = C['home_sections']
    exp_imgs = hs[1]['imgs']
    exp_titles = ['Master-Planning', 'Multi-Family & Mixed-Use', 'Retail & Restaurants', 'Aviation',
                  'Custom Single-Family', 'Office & Workplace', 'Preservation & Adaptive Re-Use',
                  'Passive House & High-Performance']
    tiles = ''.join(f'<div class="tile tile--center reveal"><div class="tile__img">{img_tag(f, i, t)}</div><h2 class="tile__title">{esc(t)}</h2></div>'
                    for i, t in zip(exp_imgs, exp_titles))
    quotes = [
        ('"Jeff has been my architect of choice on four projects now. He was instrumental in the design of the Creamery in Beaver, Utah (the first project) helping our team navigate the complexity of building a 12,000 square foot retail visitor center for the Creamery cheese brand. When we needed to expand the store footprint, Jeff was there to assist and design again. Currently working on two additional projects with him, Jeff listens and provides valuable solutions drawn from his broad experience. He has my highest recommendation."', 'Marie'),
        ('“I have worked with Knighton Architecture on multiple projects - most recently being Rodizio Grill locations in Denver, Fort Lauderdale, and Orlando. Jeff is professional, timely, and incredibly creative. He has been able to make our vision come to life in stunningly beautiful restaurants."', 'Ashlee'),
        ("“I have worked with Knighton Architecture for years and I'm always impressed with their designs and professionalism on all projects. As a general contractor, i fully understand that the choice of architect can make or break a project. I will gladly do any job with knighton architecture any time. some architects seam to not understand the construction process or they have unrealistic expectations. knighton is down to earth, easy to work with, and is a team player.”", 'Jed'),
    ]
    q = ''.join(f'<blockquote class="quote reveal"><p>{esc(t)}</p><p class="quote__by">- {n}</p></blockquote>' for t, n in quotes)
    hero_video = {'hls': 'https://video.squarespace-cdn.com/content/v1/65b42ae99f9c94748f626c66/04f2d1f5-4e60-4bd7-bf9f-a3ffecf70a4b/playlist.m3u8',
                  'poster': 'https://video.squarespace-cdn.com/content/v1/65b42ae99f9c94748f626c66/04f2d1f5-4e60-4bd7-bf9f-a3ffecf70a4b/thumbnail'}
    under_video = {'hls': 'https://video.squarespace-cdn.com/content/v1/65b42ae99f9c94748f626c66/1efb5540-3b9b-49c2-8434-0590b76fa811/playlist.m3u8',
                   'poster': 'https://video.squarespace-cdn.com/content/v1/65b42ae99f9c94748f626c66/1efb5540-3b9b-49c2-8434-0590b76fa811/thumbnail'}
    loc_img = hs[4]['imgs'][0]
    cta_bg = hs[5]['bg']
    body = f'''<section class="hero-video curve-bottom" style="--next-bg:#fafafa" aria-label="Knighton Architecture">
  {video_tag(hero_video, autoplay=True)}
  <div class="word-rotator"><span data-words="EXPLORE,CREATE,ELEVATE">EXPLORE</span></div>
</section>

<section class="section section--light" style="padding-top:40px">
  <div class="wrap">
    <h2 class="eyebrow">OUR EXPERIENCE</h2>
    <div class="grid grid--4">{tiles}</div>
  </div>
</section>

<section class="understory">
  <div class="section__bg">{video_tag(under_video, autoplay=True)}</div>
  <div class="wrap" style="position:relative;z-index:1">
    <div class="understory__row">
      <img class="understory__logo" src="{asset(f, hs[2]['imgs'][0])}" alt="The Understory Collection">
      <a class="btn btn--circle" href="https://theunderstorycollection.com/" target="_blank" rel="noopener">THE UNDERSTORY<br>COLLECTION SITE</a>
    </div>
    <p class="understory__tag">Architecture that roots itself quietly in the neighborhood fabric. Denser than a house, more human than a tower — the vital middle ground that healthy cities are built upon.</p>
  </div>
</section>

<section class="section section--dark testimonials">
  <div class="wrap">
    <h2 class="eyebrow">CLIENT TESTIMONIALS</h2>
    <div class="grid grid--3">{q}</div>
  </div>
</section>

<section class="section section--white">
  <div class="wrap center">
    <h1 class="reveal" style="font-size:var(--h1)">LOCATIONS &amp; LICENSES</h1>
    <img class="reveal" src="{asset(f, loc_img)}" alt="Map of the United States showing states where Knighton Architecture is licensed" style="margin:0 auto;max-width:1100px;width:100%">
  </div>
</section>

<section class="section cta">
  <div class="section__bg">{img_tag(f, cta_bg, '')}</div>
  <div class="wrap">
    <h2>We want to hear from you!</h2>
    <a class="btn" href="contact-1.html">Begin your new project here</a>
  </div>
</section>
'''
    write(f, head(f, C['home_meta']) + header(f) + body + footer(f))


# ---------------------------------------------------------------- SERVICES
def build_services():
    f = 'working-1.html'
    code = C['services_blocks'][1]['html']
    def r(m):
        u = m.group(0).split('?')[0]
        loc = IMAP.get(u)
        return asset(f, 'assets/img/' + loc) if loc else m.group(0)
    code = re.sub(r'https?://images\.squarespace-cdn\.com/content/v1/[^"\'\s)]+', r, code)
    code = fix_links(f, code)
    body = f'''<section class="section section--green section--first curve-bottom" style="--next-bg:#292929">
  <div class="wrap center">
    <h1 style="font-size:var(--h1)">OUR SERVICES</h1>
    <div class="services-module">{code}</div>
  </div>
</section>
'''
    write(f, head(f, C['services_meta'], '<style>.services-module .reveal-button{color:#fff}.services-module p{color:#fff}</style>') + header(f, 'working-1.html') + body + footer(f))


# ---------------------------------------------------------------- TEAM
def build_team():
    f = 'our-team.html'
    intro = ''.join(fix_links(f, b['html']) for b in C['team_intro'] if b['type'] == 'text')
    tiles = ''.join(
        f'<a class="team-tile reveal" href="{rel(f, map_url(m["href"]))}">{img_tag(f, m["card_img"], m["name"])}<span class="team-tile__name">{esc(m["name"])}</span></a>'
        for m in C['team'])
    body = f'''<section class="section section--dark section--first" style="padding-bottom:50px">
  <div class="wrap" style="max-width:1100px">{intro}</div>
</section>
<section class="section section--light" style="padding:40px 0 50px">
  <div class="wrap"><div class="grid grid--4">{tiles}</div></div>
</section>
'''
    body = body.replace('<h1>', '<h1 style="font-size:clamp(2rem,3.4vw,3rem);text-align:center">', 1)
    write(f, head(f, C['team_meta']) + header(f, 'our-team.html') + body + footer(f))
    team = C['team']
    for k, m in enumerate(team):
        p = map_url(m['href'])
        imgs = [b for b in m['blocks'] if b['type'] == 'image']
        text = ''.join(fix_links(p, b['html']) for b in m['blocks'] if b['type'] == 'text')
        scene = imgs[0]['src'] if imgs else None
        shot = imgs[1]['src'] if len(imgs) > 1 else None
        nxt = team[(k + 1) % len(team)]
        body = f'''<div class="bio-band"></div>
<section class="wrap bio">
  <div class="bio__images">
    {img_tag(p, shot, m['name'], 'bio__headshot', lazy=False)}
    {img_tag(p, scene, '', 'bio__scene')}
  </div>
  <div class="bio__text">{text}</div>
</section>
<div class="bio-next"><a href="{rel(p, map_url(nxt['href']))}">{esc(nxt['name'])}</a></div>
'''
        write(p, head(p, m['meta']) + header(p, 'our-team.html') + body + footer(p))


# ---------------------------------------------------------------- WORK
def build_work():
    f = 'work.html'
    cards = ''.join(
        f'<a class="tile reveal" href="{rel(f, map_url(it["href"]))}"><div class="tile__img">{img_tag(f, it["card_img"], it["card_title"])}</div><h3 class="tile__title">{esc(it["card_title"])}</h3></a>'
        for it in C['projects'])
    body = f'''<section class="section section--dark section--first" style="padding-bottom:40px">
  <div class="wrap center"><h1 style="font-size:clamp(1.4rem,2.2vw,2rem)">{esc(C['work_intro'])}</h1></div>
</section>
<section class="section section--light" style="padding-top:40px">
  <div class="wrap"><div class="grid grid--4">{cards}</div></div>
</section>
'''
    write(f, head(f, C['work_meta']) + header(f, 'work.html') + body + footer(f))
    for it in C['projects']:
        build_project(it)


def render_blocks(p, blocks):
    """Text + buttons on the left, maps/images/videos on the right."""
    left, right = [], []
    for b in blocks:
        t = b['type']
        if t == 'text':
            left.append(fix_links(p, b['html']))
        elif t == 'button':
            tgt = ' target="_blank" rel="noopener"' if b['href'].startswith('http') else ''
            left.append(f'<p><a class="btn" href="{esc(rel(p, map_url(b["href"])), quote=True)}"{tgt}>{esc(b["text"])}</a></p>')
        elif t == 'map':
            right.append(map_iframe(b))
        elif t == 'image':
            right.append(img_tag(p, b['src'], b.get('alt', '')))
        elif t == 'video':
            right.append(f'<div class="video-wrap">{video_tag(b)}</div>')
        elif t == 'embed' and b.get('src'):
            right.append(f'<div class="video-wrap"><iframe src="{b["src"]}" allowfullscreen loading="lazy" title="Video"></iframe></div>')
    return left, right


def build_project(it):
    p = map_url(it['href'])
    out = []
    for i, s in enumerate(it['sections']):
        if s['kind'] == 'gallery':
            out.append(slideshow(p, dedupe_imgs(s['images'])))
            continue
        if i == 0:  # hero
            out.append(f'<section class="project-hero">{img_tag(p, s["bg"], it["card_title"], lazy=False)}</section>')
            continue
        left, right = render_blocks(p, s['blocks'])
        theme = THEME.get(s.get('theme', ''), 'section--light')
        has_video = any(b['type'] in ('video', 'embed') for b in s['blocks'])
        if has_video and not any(b['type'] == 'map' for b in s['blocks']):
            out.append(f'<section class="section {theme} video-band"><div class="wrap" style="max-width:1100px">{"".join(left)}{"".join(right)}</div></section>')
        else:
            cls = 'project-body' + ('' if right else ' single')
            out.append(f'<section class="section {theme}"><div class="wrap {cls}"><div class="project-text">{"".join(left)}</div>'
                       + (f'<div class="project-media">{"".join(right)}</div>' if right else '') + '</div></section>')
    body = '\n'.join(out)
    write(p, head(p, it['meta']) + header(p, 'work.html') + body + footer(p))


# ---------------------------------------------------------------- JOURNAL
def build_journal():
    f = 'field-journal.html'
    cards = ''.join(
        f'<a class="post-card reveal" href="{rel(f, map_url(po["href"]))}"><div class="post-card__img">{img_tag(f, po["cover"], po["title"])}</div><h3>{esc(po["title"])}</h3></a>'
        for po in C['posts'])
    body = f'''<section class="section section--dark section--first journal-hero">
  <div class="wrap"><h1>FIELD JOURNAL</h1><h2>THE KNIGHTON ARCHITECTURE TEAM BLOG</h2></div>
</section>
<section class="section section--light">
  <div class="wrap"><div class="grid grid--3">{cards}</div></div>
</section>
'''
    write(f, head(f, C['journal_meta']) + header(f, 'field-journal.html') + body + footer(f))
    posts = C['posts']
    for k, po in enumerate(posts):
        p = map_url(po['href'])
        parts = []
        for b in po['blocks']:
            t = b['type']
            if t == 'text':
                parts.append(fix_links(p, b['html']))
            elif t == 'gallery':
                parts.append('<div class="post-gallery" data-lightbox>' + ''.join(img_tag(p, u, '') for u in dedupe_imgs(b['images'])) + '</div>')
            elif t == 'image':
                parts.append(f'<figure data-lightbox>{img_tag(p, b["src"], b.get("alt", ""))}</figure>')
            elif t == 'embed' and b.get('src'):
                parts.append(f'<div class="video-wrap"><iframe src="{b["src"]}" allowfullscreen loading="lazy" title="Video"></iframe></div>')
        prev_ = posts[k - 1] if k > 0 else None
        next_ = posts[k + 1] if k + 1 < len(posts) else None
        nav = '<nav class="post-nav">'
        nav += f'<a href="{rel(p, map_url(prev_["href"]))}">&#8249; {esc(prev_["title"])}</a>' if prev_ else '<span></span>'
        nav += f'<a href="{rel(p, map_url(next_["href"]))}" style="text-align:right">{esc(next_["title"])} &#8250;</a>' if next_ else '<span></span>'
        nav += '</nav>'
        body = f'''<section class="section section--white section--first">
  <article class="wrap post">
    <p class="post__date">{esc(po["date"])}</p>
    <h1>{esc(po["title"])}</h1>
    <div class="post-body">{"".join(parts)}</div>
    {nav}
  </article>
</section>
'''
        write(p, head(p, po['meta']) + header(p, 'field-journal.html', dark=True) + body + footer(p))


# ---------------------------------------------------------------- CONTACT
def build_contact():
    f = 'contact-1.html'
    cs = C['contact_sections']
    btn = next(b for b in cs[0]['blocks'] if b['type'] == 'button')
    mp = next(b for b in cs[1]['blocks'] if b['type'] == 'map')
    body = f'''<section class="contact-hero">
  {WAVES}
  <div class="wrap">
    <h1>Meet with Us</h1>
    <p style="margin:1.6rem 0"><a class="btn btn--light" href="{esc(btn['href'], quote=True)}" target="_blank" rel="noopener">Get Started</a></p>
    <p>No pressure, just here to help!</p>
  </div>
</section>
<section class="visit">
  <div class="visit__text">
    <h1>Visit us</h1>
    <p>{ADDRESS.replace('Suite 227, ', 'Suite 227,<br>')}</p>
    <p><strong>Hours</strong><br>Monday–Friday<br>10am–5pm</p>
    <p><strong>Phone</strong><br><a href="tel:+18015921582">(801) 592-1582</a></p>
    <p><strong>Email</strong><br><a href="mailto:{EMAIL}">{EMAIL}</a></p>
  </div>
  {map_iframe(mp).replace('class="map-frame"', 'class=""')}
</section>
'''
    write(f, head(f, C['contact_meta']) + header(f, None) + body + footer(f))


if __name__ == '__main__':
    build_home(); build_services(); build_team(); build_work(); build_journal(); build_contact()
    n = sum(len(fs) for _, _, fs in os.walk(SITE) if True)
    print('built. files in site/:', n)
