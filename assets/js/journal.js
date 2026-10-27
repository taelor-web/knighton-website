/* Field Journal: page tone, story filters, long galleries, photo lightbox, click-to-play videos */
(function () {
  const root = document.documentElement, turn = document.getElementById("turn");
  const tone = () => { root.dataset.tone = turn && turn.getBoundingClientRect().top <= innerHeight * 0.55 ? "dark" : "light"; };
  addEventListener("scroll", tone, { passive: true }); addEventListener("resize", tone); tone();
  window.FJ_EMBED = true;
  /* filters */
  document.querySelectorAll(".fj-chips").forEach(g => {
    const scope = g.closest(".fj-index"), items = [...scope.querySelectorAll("[data-list] > *")], empty = scope.querySelector(".fj-empty");
    g.querySelectorAll("button").forEach(b => b.addEventListener("click", () => {
      g.querySelectorAll("button").forEach(x => x.setAttribute("aria-pressed", x === b));
      let n = 0; items.forEach(it => { const c = it.dataset.cat || (it.firstElementChild && it.firstElementChild.dataset.cat); const show = !b.dataset.f || c === b.dataset.f; it.hidden = !show; n += show; });
      if (empty) empty.hidden = n > 0;
    }));
  });

  /* long galleries: show nine, then "Show all" */
  document.querySelectorAll(".jg").forEach(g => {
    const n = g.querySelectorAll(".jg-i").length; if (n <= 9) return;
    g.classList.add("jg-more");
    const b = document.createElement("button"); b.type = "button"; b.className = "jg-btn"; b.textContent = "Show all " + n + " photos";
    b.addEventListener("click", () => { g.classList.remove("jg-more"); b.remove(); }); g.appendChild(b);
  });

  /* lightbox (story pages only) */
  const lb = document.getElementById("lb");
  if (lb) {
  const lbImg = lb.querySelector("img"), lbC = lb.querySelector(".lb-c");
  let set = [], k = 0;
  const show = i => { k = (i + set.length) % set.length; lbImg.src = set[k].src; lbC.textContent = (k + 1) + " / " + set.length; };
  document.querySelectorAll(".jg").forEach(g => g.querySelectorAll(".jg-i").forEach((b, i) => b.addEventListener("click", () => { set = [...g.querySelectorAll(".jg-i img")]; show(i); lb.hidden = false; lb.querySelector(".lb-x").focus(); })));
  const close = () => { lb.hidden = true; };
  lb.querySelector(".lb-x").addEventListener("click", close);
  lb.querySelector(".lb-prev").addEventListener("click", () => show(k - 1));
  lb.querySelector(".lb-next").addEventListener("click", () => show(k + 1));
  lb.addEventListener("click", e => { if (e.target === lb) close(); });
  addEventListener("keydown", e => { if (lb.hidden) return; if (e.key === "Escape") close(); if (e.key === "ArrowLeft") show(k - 1); if (e.key === "ArrowRight") show(k + 1); });

  }
  /* videos: on the live site a click swaps the photo for the YouTube player */
  if (window.FJ_EMBED) document.querySelectorAll(".jvid[data-yt]").forEach(a => a.addEventListener("click", e => {
    e.preventDefault(); a.innerHTML = '<iframe src="https://www.youtube-nocookie.com/embed/' + a.dataset.yt + '?autoplay=1" allow="autoplay; fullscreen" allowfullscreen title="Video"></iframe>';
  }));

  })();
