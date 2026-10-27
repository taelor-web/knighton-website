(function () {
  const root = document.documentElement, turn = document.querySelector("[data-turn]");
  const tone = () => { root.dataset.tone = turn && turn.getBoundingClientRect().top <= innerHeight * 0.55 ? "dark" : "light"; };
  addEventListener("scroll", tone, { passive: true }); addEventListener("resize", tone); tone();
  /* rail: highlight the chapter you're reading */
  const rl = [...document.querySelectorAll(".crail a[data-c]")];
  function rail() { let cur = null; rl.forEach(a => { const el = document.getElementById(a.dataset.c); if (el && el.getBoundingClientRect().top < innerHeight * 0.4) cur = a; }); rl.forEach(a => a.classList.toggle("on", a === cur)); }
  addEventListener("scroll", rail, { passive: true }); rail();
  /* one step open at a time within a chapter */
  document.querySelectorAll(".dsteps").forEach(g => { const ds = [...g.querySelectorAll(".dstep")]; ds.forEach(d => d.addEventListener("toggle", () => { if (d.open) ds.forEach(o => { if (o !== d) o.open = false; }); })); });
  /* links to a step (#d-step-2) open it */
  function openHash() { const el = document.getElementById(location.hash.slice(1)); if (el && el.tagName === "DETAILS") el.open = true; }
  addEventListener("hashchange", openHash); openHash();
  /* tool gallery: arrows, and tags jump to the right card */
  const row = document.querySelector(".tg-row");
  document.querySelectorAll(".tg-b").forEach(b => b.addEventListener("click", () => { const c = row.querySelector(".tg"); row.scrollBy({ left: (+b.dataset.d) * (c.offsetWidth + 16), behavior: "smooth" }); }));
  document.querySelectorAll(".dtag").forEach(t => t.addEventListener("click", e => {
    const card = document.getElementById(t.getAttribute("href").slice(1)); if (!card) return; e.preventDefault();
    document.getElementById("d-tools").scrollIntoView({ behavior: "smooth" });
    row.scrollTo({ left: card.offsetLeft - row.offsetLeft - parseFloat(getComputedStyle(row).paddingLeft), behavior: "smooth" });
    card.classList.add("hl"); setTimeout(() => card.classList.remove("hl"), 1800);
  }));
})();
