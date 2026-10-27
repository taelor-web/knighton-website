/* Knighton Architecture: Our Work & Services (service filters over the project grid, deep links, page tone) */
(function () {
  const root = document.documentElement;
  const turn = document.getElementById("turn");
  const tone = () => { root.dataset.tone = turn && turn.getBoundingClientRect().top <= innerHeight * 0.55 ? "dark" : "light"; };
  addEventListener("scroll", tone, { passive: true }); addEventListener("resize", tone); tone();

  /* Tabs: Projects & services | Fees & estimator */
  const tabs = [...document.querySelectorAll(".sc-tabs [role=tab]")];
  function select(i) { tabs.forEach((t, j) => { t.setAttribute("aria-selected", j === i); t.tabIndex = j === i ? 0 : -1; document.getElementById(t.getAttribute("aria-controls")).hidden = j !== i; }); }
  tabs.forEach((t, i) => {
    t.addEventListener("click", () => select(i));
    t.addEventListener("keydown", e => { if (e.key === "ArrowRight" || e.key === "ArrowLeft") { e.preventDefault(); const j = (i + (e.key === "ArrowRight" ? 1 : -1) + tabs.length) % tabs.length; select(j); tabs[j].focus(); } });
  });
  select(location.hash === "#fees" ? 1 : 0);

  /* Services filter the project grid and describe themselves above it */
  const svc = JSON.parse(document.getElementById("svcData").textContent);
  const cards = [...document.querySelectorAll(".wk")], btns = [...document.querySelectorAll(".fl")];
  const selG = document.getElementById("selG"), selN = document.getElementById("selN"), selD = document.getElementById("selD"), selC = document.getElementById("selC");
  const ALL = selD.textContent;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  function filter(f, scroll) {
    btns.forEach(b => b.setAttribute("aria-pressed", b.dataset.f === f));
    let n = 0;
    cards.forEach(c => {
      const show = !f || c.dataset.tags.split("|").includes(f);
      c.hidden = !show; c.classList.remove("in");
      if (show) { n++; if (!reduce) { void c.offsetWidth; c.style.animationDelay = Math.min(n, 8) * 40 + "ms"; c.classList.add("in"); } }
    });
    selG.textContent = f ? svc[f].g : "All work";
    selN.textContent = f || "All projects";
    selD.textContent = f ? svc[f].d : ALL;
    selC.textContent = n + (n === 1 ? " project" : " projects");
    document.getElementById("wkEmpty").hidden = n > 0;
    if (scroll) { const top = document.querySelector(".ws-sel").getBoundingClientRect().top + scrollY - (innerWidth <= 980 ? 130 : 110); if (scrollY > top) scrollTo({ top, behavior: reduce ? "auto" : "smooth" }); }
    const btn = btns.find(b => b.dataset.f === f); btn && btn.scrollIntoView && innerWidth <= 980 && btn.scrollIntoView({ inline: "center", block: "nearest" });
  }
  const slug = s => s.toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  btns.forEach(b => b.addEventListener("click", () => { filter(b.dataset.f, true); try { history.replaceState(null, "", b.dataset.f ? "#" + slug(b.dataset.f) : location.pathname); } catch (e) {} }));
  /* Deep links: work.html#interior-design opens with that service selected (the homepage's What We Design rows link here) */
  const hash = (location.hash || "").slice(1);
  const fromHash = Object.keys(svc).find(n => slug(n) === hash);
  if (fromHash) filter(fromHash, false);

  /* Fee estimator, from the published typical ranges */
  const type = document.getElementById("estType"), val = document.getElementById("estVal");
  if (type && val) {
    const fees = JSON.parse(document.getElementById("feeData").textContent);
    const cfg = {
      pct: { lbl: "Expected construction cost", min: 500000, max: 30000000, step: 250000, v: 4000000, lo: x => x * .03, hi: x => x * .07, fmt: x => "$" + (x >= 1e6 ? (x / 1e6).toFixed(2).replace(/\.?0+$/, "") + "M" : Math.round(x / 1e3) + "K") },
      sf: { lbl: "Livable square feet", min: 1500, max: 12000, step: 100, v: 4500, lo: x => x * 3, hi: x => x * 7, fmt: x => x.toLocaleString() + " sq ft" },
      ac: { lbl: "Developable acres", min: 2, max: 400, step: 1, v: 40, lo: x => x * 1000, hi: x => x * 2000, fmt: x => x + " acres" }
    };
    const money = x => x >= 1e6 ? "$" + (x / 1e6).toFixed(2).replace(/\.?0+$/, "") + "M" : "$" + Math.round(x / 1e3).toLocaleString() + "K";
    const basis = { pct: "3–7% of construction cost", sf: "$3–$7 per livable sq ft", ac: "$1K–$2K per developable acre" };
    function calc() {
      const c = cfg[type.value], x = +val.value, f = fees.find(f => f.u === type.value);
      document.getElementById("estOut").textContent = c.fmt(x);
      document.getElementById("estN").textContent = money(c.lo(x)) + "–" + money(c.hi(x));
      document.getElementById("estB").textContent = "Based on a typical " + basis[type.value];
      document.getElementById("estF").textContent = f.fac.join("; ") + ".";
    }
    function setType() { const c = cfg[type.value]; val.min = c.min; val.max = c.max; val.step = c.step; val.value = c.v; document.getElementById("estLbl").textContent = c.lbl; calc(); }
    type.addEventListener("change", setType); val.addEventListener("input", calc); setType();
  }
})();
