/* Knighton Architecture: Who We Are page (faces grid, profile pop-up, page tone) */
(function () {
  const root = document.documentElement;
  /* Page tone: one fade to charcoal at the join section (header.js reads it to color the shield) */
  const turn = document.querySelector("[data-turn]");
  function tone() { root.dataset.tone = turn && turn.getBoundingClientRect().top <= innerHeight * 0.55 ? "dark" : "light"; }
  addEventListener("scroll", tone, { passive: true }); addEventListener("resize", tone); tone();

  /* Profiles open in the middle of the screen; the page behind dims and blurs */
  const order = [...document.querySelectorAll(".face")].map(f => f.dataset.p);
  const modal = document.getElementById("modal"), body = document.getElementById("modalBody"), count = document.getElementById("mCount");
  const box = modal.querySelector(".modal-box");
  let cur = -1, lastFocus = null;
  function show(i) {
    cur = (i + order.length) % order.length;
    const t = document.getElementById("pf-" + order[cur]);
    body.replaceChildren(t.content.cloneNode(true)); window.__fill && __fill(body);
    box.setAttribute("aria-labelledby", "pfn-" + order[cur]);
    count.textContent = (cur + 1) + " / " + order.length;
    body.scrollTop = 0;
  }
  function open(k) {
    lastFocus = document.activeElement;
    modal.hidden = false; document.body.classList.add("modal-open");
    show(order.indexOf(k));
    modal.querySelector(".mclose").focus();
  }
  function close() { modal.hidden = true; document.body.classList.remove("modal-open"); lastFocus && lastFocus.focus(); }
  document.querySelectorAll(".face").forEach(f => f.addEventListener("click", () => open(f.dataset.p)));
  modal.addEventListener("click", e => { if (e.target.closest("[data-close]")) close(); });
  document.getElementById("mPrev").onclick = () => show(cur - 1);
  document.getElementById("mNext").onclick = () => show(cur + 1);
  document.addEventListener("keydown", e => {
    if (modal.hidden) return;
    if (e.key === "Escape") close();
    else if (e.key === "ArrowRight") show(cur + 1);
    else if (e.key === "ArrowLeft") show(cur - 1);
    else if (e.key === "Tab") { /* keep focus inside the pop-up */
      const f = [...box.querySelectorAll("button, a[href], summary")].filter(x => x.offsetParent);
      if (!f.length) return;
      if (e.shiftKey && document.activeElement === f[0]) { e.preventDefault(); f[f.length - 1].focus(); }
      else if (!e.shiftKey && document.activeElement === f[f.length - 1]) { e.preventDefault(); f[0].focus(); }
    }
  });

  /* Deep links: our-team.html#wesley opens that profile (the old bio pages redirect here) */
  const k = (location.hash || "").slice(1);
  if (order.includes(k)) open(k);
})();

