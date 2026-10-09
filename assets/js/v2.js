/* Knighton Architecture: v2 page tone, reveal and hero-word behaviour (header: see header.js) */
(function () {
  const root = document.documentElement;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* Hero video: hold it on its poster frame for visitors who ask for reduced motion */
  const heroVideo = document.querySelector(".hero video");
  if (heroVideo && reduce) { heroVideo.removeAttribute("autoplay"); heroVideo.pause(); }

  /* Hero words: hovering one outlines it and shrinks the other two. Each word links to its section of the Our Approach page. On touch screens a tap simply follows the link. */
  const rot = document.getElementById("rot");
  if (rot) {
  let offTimer;
  rot.querySelectorAll("a").forEach(sp => {
    const on = () => { clearTimeout(offTimer); rot.classList.add("has-active"); rot.querySelectorAll("a").forEach(x => x.classList.toggle("active", x === sp)); };
    sp.addEventListener("mouseenter", on); sp.addEventListener("focus", on);
  });
  const off = () => { rot.classList.remove("has-active"); rot.querySelectorAll("a").forEach(x => x.classList.remove("active")); };
  /* A short grace period, so cutting diagonally from one word to the next doesn't flash all three back to full size */
  rot.addEventListener("mouseleave", () => { clearTimeout(offTimer); offTimer = setTimeout(off, 120); });
  rot.addEventListener("focusout", e => { if (!rot.contains(e.relatedTarget)) off(); });
  }

  /* What we design: pointing at (or focusing) a category swaps the large image and the caption */
  const wwd = document.getElementById("wwd");
  if (wwd) {
    const rows = [...wwd.querySelectorAll("a")], fig = document.querySelector(".wwd-fig");
    const imgs = fig ? [...fig.querySelectorAll(":scope > img")] : [], caps = fig ? [...fig.querySelectorAll("figcaption p")] : [];
    const pick = i => { rows.forEach((r, j) => r.classList.toggle("on", j === i)); imgs.forEach((m, j) => m.classList.toggle("on", j === i)); caps.forEach((c, j) => c.classList.toggle("on", j === i)); };
    rows.forEach((r, i) => { r.addEventListener("mouseenter", () => pick(i)); r.addEventListener("focus", () => pick(i)); });
  }

  /* Page: white for the first half, then one fade to charcoal from the element with id="turn" down.
     (The header and its menu live in header.js, which reads this tone to color the shield.) */
  const turn = document.getElementById("turn");
  function update() {
    const dark = !!turn && turn.getBoundingClientRect().top <= innerHeight * 0.55;
    root.dataset.tone = dark ? "dark" : "light";
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
})();
