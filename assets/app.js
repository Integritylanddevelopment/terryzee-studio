(function () {
  "use strict";
  var SUPABASE_URL = "https://tcaepaoeauuuyhgbuwth.supabase.co";
  var SUPABASE_KEY = "sb_publishable_7t6bygX3qEY-5LHci36WiQ_AVvDGG--";
  var CONTACT_EMAIL = "support@integritydigital.com";

  // nav scrolled state
  var nav = document.querySelector(".nav");
  function onScroll() { if (nav) nav.classList.toggle("scrolled", window.scrollY > 40); }
  window.addEventListener("scroll", onScroll, { passive: true }); onScroll();

  // mobile menu
  var burger = document.getElementById("burger"),
      menu = document.getElementById("menu"),
      mclose = document.getElementById("menuClose");
  function openMenu() { if (menu) { menu.classList.add("open"); document.body.classList.add("lock"); } }
  function closeMenu() { if (menu) { menu.classList.remove("open"); document.body.classList.remove("lock"); } }
  if (burger) burger.addEventListener("click", openMenu);
  if (mclose) mclose.addEventListener("click", closeMenu);
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") closeMenu(); });
  if (menu) menu.querySelectorAll("nav a").forEach(function (a) { a.addEventListener("click", closeMenu); });

  // year
  var y = document.getElementById("year"); if (y) y.textContent = String(new Date().getFullYear());

  // staggered top-to-bottom reveals, one element after another per section
  var STAGGER = 700, LEAD = 120;
  function revealGroup(el) {
    el.classList.add("in");
    var kids = el.querySelectorAll(".reveal");
    kids.forEach(function (k, i) { setTimeout(function () { k.classList.add("in"); }, LEAD + i * STAGGER); });
  }
  var groups = document.querySelectorAll("[data-seq]");
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (ents) {
      ents.forEach(function (en) { if (en.isIntersecting) { revealGroup(en.target); io.unobserve(en.target); } });
    }, { threshold: 0.16, rootMargin: "0px 0px -8% 0px" });
    groups.forEach(function (g) { io.observe(g); });
    // any stray reveals not inside a group
    var solo = new IntersectionObserver(function (ents) {
      ents.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add("in"); solo.unobserve(en.target); } });
    }, { threshold: 0.16 });
    document.querySelectorAll(".reveal").forEach(function (el) { if (!el.closest("[data-seq]")) solo.observe(el); });
  } else {
    document.querySelectorAll(".reveal, [data-seq]").forEach(function (el) { el.classList.add("in"); });
  }

  // contact form
  var form = document.getElementById("leadForm");
  if (form) {
    var msg = document.getElementById("formMsg");
    var btn = form.querySelector("button[type=submit]");
    function mark(el, bad) { el.closest(".field").classList.toggle("bad", bad); }
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var n = form.name_, em = form.email, ph = form.phone, bd = form.message, tp = form.company;
      if (tp && tp.value) return;
      var okN = n.value.trim().length > 1,
          okE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(em.value.trim()),
          dg = ph.value.replace(/\D/g, ""), okP = dg.length >= 7 && dg.length <= 15;
      mark(n, !okN); mark(em, !okE); mark(ph, !okP);
      if (!okN || !okE || !okP) { msg.className = "form-msg err"; msg.textContent = "Please add your name, a valid email, and a valid phone number."; return; }
      btn.disabled = true; var lab = btn.querySelector("span") ? btn.querySelector("span").textContent : btn.textContent;
      if (btn.querySelector("span")) btn.querySelector("span").textContent = "Sending…";
      var payload = {
        name: n.value.trim(), email: em.value.trim(), phone: ph.value.trim(),
        message: "[" + (form.project ? form.project.value : "General") + " / " + (form.budget ? form.budget.value : "—") + "] " + (bd.value.trim() || "")
      };
      fetch(SUPABASE_URL + "/rest/v1/leads", {
        method: "POST",
        headers: { apikey: SUPABASE_KEY, "Content-Type": "application/json", Prefer: "return=minimal" },
        body: JSON.stringify(payload)
      }).then(function (r) {
        if (!r.ok) throw 0;
        msg.className = "form-msg ok"; msg.textContent = "Received. Terry Zee's studio will be in touch to begin your consultation.";
        form.reset();
      }).catch(function () {
        msg.className = "form-msg err";
        msg.innerHTML = 'Couldn’t send just now. Please email <a href="mailto:' + CONTACT_EMAIL + '">' + CONTACT_EMAIL + '</a>.';
      }).finally(function () {
        btn.disabled = false; if (btn.querySelector("span")) btn.querySelector("span").textContent = lab;
      });
    });
  }
})();
