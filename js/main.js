(function () {
  var cfg = window.INVITE || {};
  var root = document.documentElement;
  root.classList.add("js");

  function $(id) { return document.getElementById(id); }

  /* ---------- Countdown ---------- */
  var target = new Date(cfg.start).getTime();
  var end = new Date(cfg.end).getTime();
  var box = $("countdown");
  var title = $("count-title");
  var el = { d: $("cd-d"), h: $("cd-h"), m: $("cd-m"), s: $("cd-s") };
  var timer;
  function tick() {
    var now = Date.now();
    var diff = target - now;
    if (diff <= 0) {
      clearInterval(timer);
      title.textContent = "Alhamdulillah";
      box.outerHTML = "<p class=\"countdown-done\">" +
        (now > end ? "The ceremony has taken place. Jazakum Allahu khairan for your duas." : "The day of the ceremony is here.") +
        "</p>";
      return;
    }
    var s = Math.floor(diff / 1000);
    el.d.textContent = Math.floor(s / 86400);
    el.h.textContent = Math.floor((s % 86400) / 3600);
    el.m.textContent = Math.floor((s % 3600) / 60);
    el.s.textContent = s % 60;
  }
  if (box && !isNaN(target)) {
    tick();
    timer = setInterval(tick, 1000);
  }

  /* ---------- Share: native share sheet where available, WhatsApp otherwise ---------- */
  var share = $("share");
  if (share && cfg.siteUrl) {
    share.href = "https://wa.me/?text=" + encodeURIComponent(cfg.shareText + " " + cfg.siteUrl);
    if (navigator.share) {
      share.addEventListener("click", function (e) {
        e.preventDefault();
        navigator.share({ title: document.title, text: cfg.shareText, url: cfg.siteUrl }).catch(function () {});
      });
    }
  }

  /* ---------- Scroll reveal and active nav link ---------- */
  if ("IntersectionObserver" in window) {
    var revealer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("in");
          revealer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    document.querySelectorAll("main > section, main > .star-rule, footer .closing").forEach(function (node) {
      node.classList.add("reveal");
      revealer.observe(node);
    });

    var links = {};
    document.querySelectorAll(".site-nav a").forEach(function (a) {
      links[a.getAttribute("href").slice(1)] = a;
    });
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        Object.keys(links).forEach(function (id) { links[id].removeAttribute("aria-current"); });
        links[entry.target.id].setAttribute("aria-current", "true");
      });
    }, { rootMargin: "-35% 0px -60% 0px" });
    Object.keys(links).forEach(function (id) {
      var section = $(id);
      if (section) spy.observe(section);
    });
  }
})();
