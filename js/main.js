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
  function put(node, value) {
    value = String(value);
    if (node.textContent === value) return;
    node.textContent = value;
    node.classList.remove("tick");
    void node.offsetWidth; // restart the animation
    node.classList.add("tick");
  }
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
    put(el.d, Math.floor(s / 86400));
    put(el.h, Math.floor((s % 86400) / 3600));
    put(el.m, Math.floor((s % 3600) / 60));
    put(el.s, s % 60);
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

  /* ---------- Opening doors ---------- */
  window.inviteReady = true;
  var gate = $("gate");
  if (gate && root.classList.contains("gated")) {
    var opened = false;
    var openGate = function () {
      if (opened) return;
      opened = true;
      gate.classList.add("open");
      setTimeout(function () { root.classList.remove("waiting"); }, 450);
      setTimeout(function () { root.classList.remove("gated"); }, 1900);
    };
    gate.addEventListener("click", openGate);
    $("gate-open").focus({ preventScroll: true });
  } else {
    root.classList.remove("gated", "waiting");
  }

  /* ---------- Stars in the hero ---------- */
  var sky = $("sky");
  if (sky) {
    for (var n = 0; n < 34; n++) {
      var star = document.createElement("span");
      star.style.left = (Math.random() * 100).toFixed(2) + "%";
      star.style.top = (Math.random() * 100).toFixed(2) + "%";
      star.style.setProperty("--s", (1.5 + Math.random() * 2.5).toFixed(1) + "px");
      star.style.setProperty("--d", (1.8 + Math.random() * 3.2).toFixed(2) + "s");
      star.style.setProperty("--o", (-Math.random() * 5).toFixed(2) + "s");
      sky.appendChild(star);
    }
  }

  /* ---------- Scroll progress line ---------- */
  var progress = $("progress");
  if (progress) {
    var queued = false;
    var paint = function () {
      queued = false;
      var max = root.scrollHeight - window.innerHeight;
      progress.style.transform = "scaleX(" + (max > 0 ? Math.min(1, window.scrollY / max) : 0) + ")";
    };
    window.addEventListener("scroll", function () {
      if (!queued) { queued = true; requestAnimationFrame(paint); }
    }, { passive: true });
    paint();
  }

  /* ---------- Scroll reveal and active nav link ---------- */
  if ("IntersectionObserver" in window) {
    var revealer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var node = entry.target;
        node.classList.add("in");
        revealer.unobserve(node);
        setTimeout(function () { node.classList.add("done"); }, 2600);
      });
    }, { threshold: 0.15 });
    document.querySelectorAll("main > section, .couple, .details, .countdown, footer .closing").forEach(function (group) {
      group.classList.add("rg");
      Array.prototype.forEach.call(group.children, function (child, index) {
        child.style.setProperty("--i", index);
      });
      revealer.observe(group);
    });
    document.querySelectorAll("main > .star-rule").forEach(function (rule) { revealer.observe(rule); });

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
