/* Knighton Architecture: v2 header, logo, page tone, reveal and hero-word behaviour */
(function () {
  const root = document.documentElement, logo = document.getElementById("logo");
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* Hero words: hovering one outlines it and shrinks the other two. Each word links to its section of the Our Approach page. On touch screens a tap simply follows the link. */
  const rot = document.getElementById("rot");
  if (rot) {
  rot.querySelectorAll("a").forEach(sp => {
    const on = () => { rot.classList.add("has-active"); rot.querySelectorAll("a").forEach(x => x.classList.toggle("active", x === sp)); };
    sp.addEventListener("mouseenter", on); sp.addEventListener("focus", on);
  });
  const off = () => { rot.classList.remove("has-active"); rot.querySelectorAll("a").forEach(x => x.classList.remove("active")); };
  rot.addEventListener("mouseleave", off);
  rot.addEventListener("focusout", e => { if (!rot.contains(e.relatedTarget)) off(); });
  }

  /* Header: full bar (logo + menu) at the top. Scrolling down, everything fades away except the small shield,
     which turns white over dark backgrounds and dark over white ones. Scrolling back up brings the menu back.
     Page: white for the first half, then one slow fade to charcoal from the testimonials down. */
  const turn = document.getElementById("turn"), hero = document.querySelector(".hero"), hdr = document.getElementById("hdr");
  let lastY = window.scrollY;
  function update() {
    const y = window.scrollY;
    const dark = !!turn && turn.getBoundingClientRect().top <= innerHeight * 0.55;
    root.dataset.tone = dark ? "dark" : "light";
    if (!document.body.classList.contains("nav-open")) {
      if (y < 80) hdr.classList.remove("compact");
      else if (y > lastY + 4) hdr.classList.add("compact");
      else if (y < lastY - 4) hdr.classList.remove("compact");
    }
    logo.classList.toggle("open", !hdr.classList.contains("compact")); /* full logo whenever the header bar is showing */
    const overHero = !!hero && hero.getBoundingClientRect().bottom > 46;
    logo.classList.toggle("on-dark", overHero || dark);
    lastY = y;
  }
  addEventListener("scroll", update, { passive: true });
  addEventListener("resize", update);
  update();

  /* Gentle reveal for content below the fold (content stays visible if script or observer is missing) */
  if ("IntersectionObserver" in window && !reduce) {
    const items = [...document.querySelectorAll(".rev")].filter(el => el.getBoundingClientRect().top > innerHeight);
    items.forEach(el => el.classList.add("pre"));
    const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add("in"); e.target.classList.remove("pre"); io.unobserve(e.target); } }), { rootMargin: "0px 0px -10% 0px" });
    items.forEach(el => io.observe(el));
  }

  /* Mobile menu */
  const mb = document.getElementById("menuBtn");
  mb.addEventListener("click", () => { const o = document.body.classList.toggle("nav-open"); mb.setAttribute("aria-expanded", o); mb.textContent = o ? "Close" : "Menu"; });
  document.querySelectorAll("nav.main a").forEach(a => a.addEventListener("click", () => { document.body.classList.remove("nav-open"); mb.setAttribute("aria-expanded", false); mb.textContent = "Menu"; }));
})();
