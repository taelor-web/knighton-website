# TODO

Items to finish before (or after) moving knightonarchitecture.com off Squarespace.
See `DOMAIN-SWITCH.md` for the cutover itself.

## Done

- [x] **Videos re-hosted** (2026-10-07). The six Squarespace-streamed videos now
      play from `assets/video/` as MP4s with local poster images, saved from the
      same 1080p streams the old site served. The four Field Journal videos stay
      as YouTube embeds, as on the old site. To swap in a higher-quality
      original from Drive later, encode it to H.264 MP4 and keep each file under
      ~50 MB (GitHub's hard limit is 100 MB).

## Should do

- [ ] **Fonts.** The site uses Google Fonts stand-ins for the Squarespace Adobe
      fonts (Bebas Neue Pro, Nudista, Purista), which are licensed for Squarespace
      only. Knighton has Creative Cloud: create an Adobe Fonts web project at
      fonts.adobe.com with those three families (if it asks for allowed domains, add `taelor-web.github.io`
      and `knightonarchitecture.com`), then swap the Google Fonts `<link>` on
      every page for the project's `use.typekit.net/<id>.css` link and update
      the `--font-*` variables in `assets/css/site.css`.
- [ ] **Clean up leftover Squarespace project URLs** and add redirects. For
      example `work/project-one-ephnc-yfl6w` = The Creamery. GitHub Pages has no
      server-side redirects, so keep a small stub page at each old URL with a
      `<meta http-equiv="refresh">` and a `<link rel="canonical">` to the new one.

- [ ] **Unsplash hotlink.** The "CREATE" step image on `working-1.html` loads
      straight from images.unsplash.com (carried over from Squarespace). Swap in
      a Knighton project photo, or download it into `assets/img/`.

## Optional

- [ ] Replace the Google Form "Get Started" button on `contact-1.html` with an
      EmailJS form, like the Ridgeline Scanning quote page.
- [ ] Animated green backgrounds (Services and Contact) are approximated with
      static wave shapes; recreate the animation if wanted.
