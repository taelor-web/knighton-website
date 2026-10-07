# Knighton Architecture website: Phase 1 recreation

This is a copy of knightonarchitecture.com (the Squarespace site), rebuilt as plain HTML/CSS/JS so it can be hosted anywhere for free and edited with Claude.

Repo: `taelor-web/knighton-website`, hosted on GitHub Pages from the `main` branch root.
Preview: https://taelor-web.github.io/knighton-website/ (the live domain is still on Squarespace; see `DOMAIN-SWITCH.md`).

## Preview and publish

**Preview locally.** Double-click `index.html` in `C:\dev\knighton-website`. All links are relative, so every page works straight from disk. (The embedded videos and map need an internet connection.)

**Publish.** Commit and push to `main`. GitHub Pages rebuilds automatically, usually within a minute or two:

```bash
git add -A
git commit -m "Describe the change"
git push
```

Watch progress under the repo's **Actions** tab. Always work in the clone at `C:\dev\knighton-website`, never in Google Drive or OneDrive: Drive sync corrupts git.

Open items are in `TODO.md`. The domain cutover checklist is `DOMAIN-SWITCH.md`.

## Folder layout

```
index.html                 Home
our-team.html              Who We Are
our-team/*.html            Team bios (8)
working-1.html             Our Services
work.html                  Featured Work
work/*.html                Project pages (22)
field-journal.html         Field Journal
field-journal/*.html       Blog posts (3)
contact-1.html             Begin Now / contact
assets/css/site.css        All styling. Colors and fonts are set at the top in :root
assets/js/site.js          Menu, word rotator, slideshows, lightbox, video loader
assets/img/                Website images (resized to 2000px max for fast loading)
assets/brand/              Logo, shield and favicon
```

Page names match the current Squarespace URLs (for example `/work/patey-aviation-park`), so existing Google results and links keep working once the domain moves. Any host that serves `.html` files without the extension (GitHub Pages, Netlify, Cloudflare Pages) handles this automatically.

## Known gaps to fix before launch

1. **Fonts:** Squarespace licenses its Adobe fonts (Bebas Neue Pro, Nudista, Purista) only for use on Squarespace. This copy uses close Google Fonts instead. If Knighton has Adobe Creative Cloud, we can make a free Adobe Fonts web project and use the real fonts. That's a one-line change in `site.css`.
2. **Videos:** the home hero video, the Understory video and the project fly-through videos still stream from Squarespace. They need a new home (YouTube, Vimeo, or an MP4 in the site) before Squarespace is cancelled. The originals are in Drive, for example "DRAFT #2 Website Video.mov".
3. **Animated green backgrounds** (Services and Contact) are Squarespace effects. They're approximated here with static wave shapes.
4. **Contact "Get Started"** still goes to the existing Google Form.
5. A few project URLs have leftover Squarespace names (`project-one-ephnc-yfl6w` = The Creamery, and so on). We can rename them in Phase 2 and add redirects.

## Source / regeneration

`_build/` has the scripts used to make this copy. `extract.py` reads the captured Squarespace pages and writes `content.json`, then `build.py` writes the HTML. You don't need these for day-to-day edits. Edit the HTML directly, or ask Claude.
