# TODO

Items to finish before (or after) moving knightonarchitecture.com off Squarespace.
See `DOMAIN-SWITCH.md` for the cutover itself.

## Must do before cutover

- [ ] **Re-host the videos.** The home hero video, the Understory video and the
      project fly-through videos still stream from Squarespace, so they stop
      working once Squarespace is cancelled. The originals are in Google Drive
      (for example "DRAFT #2 Website Video.mov"). Options: YouTube/Vimeo embed,
      or a compressed MP4 in the repo (keep each file well under 100 MB, GitHub's
      hard limit). `assets/js/site.js` has the video loader.

## Should do

- [ ] **Fonts.** The site uses Google Fonts stand-ins for the Squarespace Adobe
      fonts (Bebas Neue Pro, Nudista, Purista), which are licensed for Squarespace
      only. If Knighton has Adobe Creative Cloud, make an Adobe Fonts web project
      and swap the font link and the `:root` font variables in
      `assets/css/site.css`.
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
