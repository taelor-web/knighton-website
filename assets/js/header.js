/* Knighton Architecture: shared site header behaviour (v2), used on every page.
   Full bar (logo + menu icon) at the top. Scrolling down, everything fades away except the small shield,
   which turns white over dark backgrounds and dark over light ones. Scrolling back up brings the bar back.
   Load after v2.js on v2 pages, so the page tone is already updated when this runs on each scroll. */
(function () {
  const hdr = document.getElementById("hdr");
  if (!hdr) return;
  const root = document.documentElement, logo = document.getElementById("logo"), shield = logo.querySelector(".shield");

  /* Is the area behind the header dark at horizontal position x (at the shield's height)? v2 pages say so with
     data-tone; Phase 1 pages are read from what is actually there: a photo or video counts as dark, otherwise the
     first solid background color. */
  function darkAt(x) {
    if (root.dataset.tone === "dark") return true;
    const r = shield.getBoundingClientRect(), y = r.top + r.height / 2;
    /* Bridge the small gaps between consecutive [data-dark] blocks (the framed homepage stories), so the bar doesn't flash light between them */
    const inDarkBlock = py => document.elementsFromPoint(x, py).some(e => !hdr.contains(e) && e.closest("[data-dark]"));
    if (inDarkBlock(y - 34) && inDarkBlock(y + 34)) return true;
    for (const el of document.elementsFromPoint(x, y)) {
      if (hdr.contains(el)) continue;
      if (el.closest("[data-dark]")) return true; /* full-screen photo blocks (the homepage project stories) */
      const toned = el.closest("[data-tone]"); /* v2 sections declare their tone; that wins over any photo inside them */
      if (toned) return toned.getAttribute("data-tone") === "dark";
      for (let n = el; n && n !== root; n = n.parentElement) {
        /* Only edge-to-edge photos (heroes) count; smaller photos defer to the section around them, as on v2 pages */
        if (/^(IMG|VIDEO|PICTURE)$/.test(n.tagName) && n.getBoundingClientRect().width >= innerWidth * .98) return true;
        if (n.tagName === "IFRAME" && /youtube|vimeo/.test(n.src)) return true; /* video players are dark; maps are read by color below */
        const cs = getComputedStyle(n);
        if (/url\(/.test(cs.backgroundImage)) return true;
        const c = cs.backgroundColor.match(/[\d.]+/g);
        if (c && (c[3] === undefined || +c[3] > .5)) return .299 * c[0] + .587 * c[1] + .114 * c[2] < 165; /* the site's greens carry white text, so they count as dark */
      }
      return false;
    }
    return false;
  }

  let lastY = window.scrollY;
  function update() {
    const y = window.scrollY;
    if (!document.body.classList.contains("nav-open")) {
      if (y < 80) hdr.classList.remove("compact");
      else if (y > lastY + 4) hdr.classList.add("compact");
      else if (y < lastY - 4) hdr.classList.remove("compact");
    }
    logo.classList.toggle("open", !hdr.classList.contains("compact")); /* full logo whenever the header bar is showing */
    /* The bar matches what is behind the middle of the header (charcoal over dark areas, white over light); once the bar
       has slid away, the small shield matches what is directly behind it. */
    const sr = shield.getBoundingClientRect();
    hdr.classList.toggle("dark", darkAt(innerWidth / 2));
    logo.classList.toggle("on-dark", darkAt(sr.left + sr.width / 2));
    lastY = y;
  }
  addEventListener("scroll", update, { passive: true });
  addEventListener("resize", update);
  update();

  /* Dropdown menu: the icon toggles it; a link, a click outside it, or Esc closes it */
  const mb = document.getElementById("menuBtn"), nav = document.getElementById("nav");
  const setMenu = o => { document.body.classList.toggle("nav-open", o); mb.setAttribute("aria-expanded", o); mb.textContent = o ? "Close" : "Menu"; };
  mb.addEventListener("click", () => setMenu(!document.body.classList.contains("nav-open")));
  nav.querySelectorAll("a").forEach(a => a.addEventListener("click", () => setMenu(false)));
  document.addEventListener("click", e => { if (document.body.classList.contains("nav-open") && !nav.contains(e.target) && !mb.contains(e.target)) setMenu(false); });
  document.addEventListener("keydown", e => { if (e.key === "Escape" && document.body.classList.contains("nav-open")) { setMenu(false); mb.focus(); } });
})();
