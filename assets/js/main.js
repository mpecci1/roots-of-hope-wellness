/* Roots of Hope & Wellness — interactions
   No framework, no build step. Progressive enhancement only. */
(function () {
  'use strict';

  /* --- sticky header shadow on scroll --- */
  var header = document.querySelector('.site-header');
  if (header) {
    var onScroll = function () {
      header.classList.toggle('scrolled', window.scrollY > 12);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  /* --- mobile nav panel --- */
  var toggle = document.querySelector('.nav-toggle');
  var panel = document.querySelector('.mobile-panel');
  if (toggle && panel) {
    var close = panel.querySelector('[data-close]');
    var open = function () { panel.classList.add('open'); document.body.style.overflow = 'hidden'; toggle.setAttribute('aria-expanded', 'true'); };
    var shut = function () { panel.classList.remove('open'); document.body.style.overflow = ''; toggle.setAttribute('aria-expanded', 'false'); };
    toggle.addEventListener('click', open);
    if (close) close.addEventListener('click', shut);
    panel.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', shut); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') shut(); });
  }

  /* --- scroll reveal (progressive enhancement) ---
     Content is visible by default. Only elements below the fold get hidden
     (.pre) and then animate in on scroll, so nothing is ever stuck invisible
     if JS is slow or disabled. */
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!reduce && 'IntersectionObserver' in window) {
    /* Hero / page-hero reveal on LOAD, so a primary CTA that falls below a
       short mobile fold still appears on first paint instead of waiting for a
       scroll. */
    var heroReveals = document.querySelectorAll('.hero .reveal, .page-hero .reveal');
    heroReveals.forEach(function (el) { el.classList.add('pre'); });
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        heroReveals.forEach(function (el) { el.classList.add('in'); el.classList.remove('pre'); });
      });
    });

    /* Everything else animates in on scroll. */
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('in');
          entry.target.classList.remove('pre');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
    document.querySelectorAll('.reveal').forEach(function (el) {
      if (el.closest('.hero, .page-hero')) return;
      if (el.getBoundingClientRect().top < window.innerHeight * 0.95) return;
      el.classList.add('pre');
      io.observe(el);
    });
  }

  /* --- current year --- */
  var y = document.querySelector('[data-year]');
  if (y) y.textContent = new Date().getFullYear();

  /* --- Formspree-style async forms ---
     Set data-endpoint to your real Formspree URL (https://formspree.io/f/XXXX).
     Until then, submits are intercepted and a friendly placeholder confirmation
     is shown so the flow is demonstrable without leaking anywhere. */
  document.querySelectorAll('form[data-form]').forEach(function (form) {
    var msg = form.querySelector('.form-msg');
    var endpoint = form.getAttribute('data-endpoint');
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (msg) { msg.className = 'form-msg'; msg.textContent = ''; }
      var btn = form.querySelector('button[type="submit"]');
      var label = btn ? btn.textContent : '';
      if (btn) { btn.disabled = true; btn.style.opacity = '.7'; }

      var done = function (ok, text) {
        if (btn) { btn.disabled = false; btn.style.opacity = ''; btn.textContent = label; }
        if (msg) { msg.className = 'form-msg ' + (ok ? 'ok' : 'err'); msg.textContent = text; }
        if (ok) form.reset();
      };

      if (!endpoint || endpoint.indexOf('YOUR_FORM_ID') !== -1) {
        // placeholder mode — no real endpoint wired yet
        setTimeout(function () {
          done(true, form.getAttribute('data-success') || 'Thank you — we’ll be in touch soon. (Demo mode: connect Formspree to receive these.)');
        }, 500);
        return;
      }

      fetch(endpoint, {
        method: 'POST',
        body: new FormData(form),
        headers: { 'Accept': 'application/json' }
      }).then(function (r) {
        if (r.ok) { done(true, form.getAttribute('data-success') || 'Thank you — we’ll be in touch soon.'); }
        else { done(false, 'Something went wrong. Please email us at RHW@rootsofhopeandwellness.com.'); }
      }).catch(function () {
        done(false, 'Network error. Please email us at RHW@rootsofhopeandwellness.com.');
      });
    });
  });

  /* --- MailerLite newsletter signups ---
     The form posts natively into a hidden iframe (no page navigation, no CORS),
     so we don't preventDefault — we just show the styled confirmation and reset.
     Invalid emails never fire submit (native validation handles them). */
  document.querySelectorAll('form.ml-newsletter').forEach(function (form) {
    var msg = form.querySelector('.form-msg');
    var btn = form.querySelector('button[type="submit"]');
    form.addEventListener('submit', function () {
      if (btn) { btn.disabled = true; btn.style.opacity = '.7'; }
      setTimeout(function () {
        if (msg) { msg.className = 'form-msg ok'; msg.textContent = form.getAttribute('data-success') || 'You’re in!'; }
        form.reset();
        if (btn) { btn.disabled = false; btn.style.opacity = ''; }
      }, 500);
    });
  });
})();
