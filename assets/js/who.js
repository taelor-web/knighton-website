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
    tune();
  }

  /* Each control (× and the two chevrons) turns light over dark parts of the place photo and dark over light ones.
     It reads the photo's brightness right behind the control and mixes in the white fade that sits over the photo. */
  const ctrls = [...modal.querySelectorAll(".mclose, .mnav")], probe = document.createElement("canvas"), pctx = probe.getContext("2d", { willReadFrequently: true });
  probe.width = probe.height = 8;
  const phone = matchMedia("(max-width: 860px)");
  const ramp = (stops, v) => { for (let i = 1; i < stops.length; i++) { const [a, x] = stops[i - 1], [b, y] = stops[i]; if (v <= b) return x + (y - x) * (v - a) / (b - a); } return 1; };
  function whiteOver(pf, x, y) { /* how much of the white fade covers this point (matches who.css) */
    const r = pf.getBoundingClientRect();
    if (phone.matches) { const d = y - r.top; return d > 420 ? 1 : ramp([[0, 0], [190, .1], [300, .93], [360, 1]], Math.max(0, d)); }
    return ramp([[0, 0], [28, .06], [42, .88], [52, .97], [100, 1]], (x - r.left) / r.width * 100);
  }
  function photoLum(img, x, y) { /* average brightness of the photo in a small patch around (x, y), with object-fit: cover */
    const r = img.getBoundingClientRect(), nw = img.naturalWidth, nh = img.naturalHeight;
    if (!nw || x < r.left || x > r.right || y < r.top || y > r.bottom) return 251;
    const s = Math.max(r.width / nw, r.height / nh), ox = (r.width - nw * s) / 2, oy = (r.height - nh * s) / 2, half = 24 / s;
    try {
      pctx.drawImage(img, (x - r.left - ox) / s - half, (y - r.top - oy) / s - half, half * 2, half * 2, 0, 0, 8, 8);
      const d = pctx.getImageData(0, 0, 8, 8).data; let t = 0;
      for (let i = 0; i < d.length; i += 4) t += .299 * d[i] + .587 * d[i + 1] + .114 * d[i + 2];
      return t / 64;
    } catch (e) { return 120; } /* unreadable photo: assume dark, so the control goes light */
  }
  function tune() {
    const pf = body.querySelector(".pf"), img = body.querySelector(".pf-place");
    if (!pf || !img || modal.hidden) return;
    if (!img.complete) { img.addEventListener("load", tune, { once: true }); return; }
    ctrls.forEach(c => {
      const b = c.getBoundingClientRect(), x = b.left + b.width / 2, y = b.top + b.height / 2, a = whiteOver(pf, x, y);
      c.classList.toggle("light", photoLum(img, x, y) * (1 - a) + 251 * a < 150);
    });
  }
  body.addEventListener("scroll", tune, { passive: true });
  addEventListener("resize", tune);
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
  /* Profile videos open in their own window above the profile (embedded YouTube, privacy-enhanced), not on YouTube */
  const vmodal = document.getElementById("vmodal"), vframe = document.getElementById("vframe"), vbox = vmodal.querySelector(".vmodal-box");
  let vFrom = null;
  const ytId = href => { const m = String(href).match(/(?:shorts\/|youtu\.be\/|[?&]v=|embed\/)([\w-]{6,})/); return m && m[1]; };
  function openVideo(a) {
    const id = ytId(a.href); if (!id) return false;
    vFrom = a;
    const f = document.createElement("iframe");
    f.src = "https://www.youtube-nocookie.com/embed/" + id + "?autoplay=1&rel=0&playsinline=1&modestbranding=1";
    f.title = a.textContent.replace(/^\W+/, "").trim();
    f.allow = "autoplay; encrypted-media; picture-in-picture; fullscreen";
    f.allowFullscreen = true;
    vframe.replaceChildren(f);
    vmodal.hidden = false;
    vmodal.querySelector(".vclose").focus();
    return true;
  }
  function closeVideo() { vmodal.hidden = true; vframe.replaceChildren(); vFrom && vFrom.focus(); } /* removing the frame stops playback */
  body.addEventListener("click", e => { const a = e.target.closest("a.chip[href]"); if (a && openVideo(a)) e.preventDefault(); });
  vmodal.addEventListener("click", e => { if (e.target.closest("[data-vclose]")) closeVideo(); });

  document.addEventListener("keydown", e => {
    if (!vmodal.hidden) { /* the video window sits on top: Esc closes it, focus stays inside it */
      if (e.key === "Escape") { e.preventDefault(); closeVideo(); }
      else if (e.key === "Tab") { e.preventDefault(); vbox.querySelector(".vclose").focus(); }
      return;
    }
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

