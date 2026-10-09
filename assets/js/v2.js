/* Knighton Architecture: v2 page tone, reveal and hero-word behaviour (header: see header.js) */
(function () {
  const root = document.documentElement;
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
