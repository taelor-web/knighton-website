/* Knighton Architecture — site behaviour (no frameworks) */
(function () {
  "use strict";

  /* Announcement bar close (remembered per visitor) */
  var bar = document.querySelector(".announce");
  if (bar) {
    try { if (sessionStorage.getItem("ka-announce-closed")) bar.remove(); } catch (e) {}
    var x = bar.querySelector(".announce__close");
    if (x) x.addEventListener("click", function () {
      bar.remove();
      try { sessionStorage.setItem("ka-announce-closed", "1"); } catch (e) {}
    });
  }

  /* Mobile navigation */
  var toggle = document.querySelector(".nav-toggle");
  if (toggle) toggle.addEventListener("click", function () {
    var open = document.body.classList.toggle("nav-open");
    toggle.setAttribute("aria-expanded", open ? "true" : "false");
  });

  /* Hero word rotator: EXPLORE → CREATE → ELEVATE */
  var rot = document.querySelector(".word-rotator span");
  if (rot) {
    var words = (rot.getAttribute("data-words") || "EXPLORE,CREATE,ELEVATE").split(",");
    var i = 0;
    rot.textContent = words[0];
    rot.classList.add("is-on");
    setInterval(function () {
      rot.classList.remove("is-on");
      setTimeout(function () {
        i = (i + 1) % words.length;
        rot.textContent = words[i];
        rot.classList.add("is-on");
      }, 1000);
    }, 4000);
  }

  /* Videos hosted as HLS streams (.m3u8). Safari plays them natively;
     other browsers use hls.js, loaded only when a page needs it. */
  var hlsVideos = document.querySelectorAll("video[data-hls]");
  if (hlsVideos.length) {
    var start = function () {
      hlsVideos.forEach(function (v) {
        var src = v.getAttribute("data-hls");
        if (v.canPlayType("application/vnd.apple.mpegurl")) { v.src = src; }
        else if (window.Hls && window.Hls.isSupported()) { var h = new window.Hls(); h.loadSource(src); h.attachMedia(v); }
        if (v.autoplay) { var p = v.play(); if (p && p.catch) p.catch(function () {}); }
      });
    };
    if (document.createElement("video").canPlayType("application/vnd.apple.mpegurl")) start();
    else {
      var s = document.createElement("script");
      s.src = "https://cdnjs.cloudflare.com/ajax/libs/hls.js/1.5.13/hls.min.js";
      s.onload = start;
      document.head.appendChild(s);
    }
  }

  /* Slideshow galleries */
  document.querySelectorAll(".slideshow").forEach(function (ss) {
    var track = ss.querySelector(".slideshow__track");
    var step = function (dir) { track.scrollBy({ left: dir * track.clientWidth * 0.8, behavior: "smooth" }); };
    var p = ss.querySelector(".slideshow__btn--prev"), n = ss.querySelector(".slideshow__btn--next");
    if (p) p.addEventListener("click", function () { step(-1); });
    if (n) n.addEventListener("click", function () { step(1); });
  });

  /* Lightbox for gallery images */
  var imgs = Array.prototype.slice.call(document.querySelectorAll("[data-lightbox] img"));
  if (imgs.length) {
    var lb = document.createElement("div");
    lb.className = "lightbox";
    lb.innerHTML = '<button class="lightbox__close" aria-label="Close">&times;</button>' +
      '<button class="lightbox__prev" aria-label="Previous">&#8249;</button><img alt="">' +
      '<button class="lightbox__next" aria-label="Next">&#8250;</button>';
    document.body.appendChild(lb);
    var big = lb.querySelector("img"), cur = 0;
    var show = function (k) { cur = (k + imgs.length) % imgs.length; big.src = imgs[cur].currentSrc || imgs[cur].src; big.alt = imgs[cur].alt; };
    imgs.forEach(function (im, k) { im.addEventListener("click", function () { show(k); lb.classList.add("is-open"); }); });
    lb.querySelector(".lightbox__close").addEventListener("click", function () { lb.classList.remove("is-open"); });
    lb.querySelector(".lightbox__prev").addEventListener("click", function () { show(cur - 1); });
    lb.querySelector(".lightbox__next").addEventListener("click", function () { show(cur + 1); });
    lb.addEventListener("click", function (e) { if (e.target === lb) lb.classList.remove("is-open"); });
    document.addEventListener("keydown", function (e) {
      if (!lb.classList.contains("is-open")) return;
      if (e.key === "Escape") lb.classList.remove("is-open");
      if (e.key === "ArrowLeft") show(cur - 1);
      if (e.key === "ArrowRight") show(cur + 1);
    });
  }

  /* Fade-in on scroll */
  var rev = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add("is-visible"); io.unobserve(en.target); } });
    }, { rootMargin: "0px 0px -8% 0px" });
    rev.forEach(function (el) { io.observe(el); });
  } else rev.forEach(function (el) { el.classList.add("is-visible"); });
})();
