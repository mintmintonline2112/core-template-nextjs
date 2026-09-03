/* ============================================================
   PRIME NUTS USA — interactions (shared across all pages)
   - mobile navigation
   - sticky header elevation
   - scroll-reveal animations (respects prefers-reduced-motion)
   - active nav-link highlighting (index page anchors)
   - quote form (index) / contact form / newsletter form
   ============================================================ */

(function () {
  'use strict';

  // Mark that JS is running so CSS can safely hide .reveal elements.
  document.documentElement.classList.add('js');

  var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Mobile navigation ---------- */

  var header = document.getElementById('site-header');
  var navToggle = document.getElementById('nav-toggle');
  var siteNav = document.getElementById('site-nav');

  function closeNav() {
    header.classList.remove('nav-open');
    navToggle.setAttribute('aria-expanded', 'false');
    navToggle.setAttribute('aria-label', 'Open menu');
  }

  navToggle.addEventListener('click', function () {
    var isOpen = header.classList.toggle('nav-open');
    navToggle.setAttribute('aria-expanded', String(isOpen));
    navToggle.setAttribute('aria-label', isOpen ? 'Close menu' : 'Open menu');
  });

  siteNav.addEventListener('click', function (event) {
    if (event.target.closest('a')) closeNav();
  });

  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape' && header.classList.contains('nav-open')) {
      closeNav();
      navToggle.focus();
    }
  });

  /* ---------- Sticky header elevation ---------- */

  function onScroll() {
    header.classList.toggle('scrolled', window.scrollY > 8);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- Scroll-reveal with staggering ---------- */

  // Sibling .reveal elements enter one after another (90ms apart).
  document.querySelectorAll('.market-grid, .why-grid, .news-grid, .hero-copy').forEach(function (group) {
    var items = group.querySelectorAll(':scope > .reveal');
    items.forEach(function (el, i) {
      el.style.setProperty('--reveal-delay', (i * 90) + 'ms');
    });
  });

  // Children of a single revealed container cascade in (see matching CSS).
  document.querySelectorAll('.doc-grid.reveal, .chain.reveal, .config-list.reveal, .photo-strip.reveal').forEach(function (group) {
    Array.prototype.forEach.call(group.children, function (el, i) {
      el.style.setProperty('--reveal-delay', (i * 70) + 'ms');
    });
  });

  document.querySelectorAll('.reveal .size-grid, .reveal .country-list, .reveal .quote-checklist').forEach(function (group) {
    Array.prototype.forEach.call(group.children, function (el, i) {
      el.style.setProperty('--reveal-delay', (i * 45) + 'ms');
    });
  });

  // Hero stats count up from zero when they come into view.
  function countUp(el) {
    var target = parseInt(el.getAttribute('data-count'), 10);
    if (isNaN(target) || el.dataset.counted) return;
    el.dataset.counted = 'true';
    var startTime = null;
    function tick(now) {
      if (startTime === null) startTime = now;
      var progress = Math.min((now - startTime) / 1400, 1);
      var eased = 1 - Math.pow(1 - progress, 3);
      el.firstChild.nodeValue = Math.round(eased * target);
      if (progress < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  var revealEls = document.querySelectorAll('.reveal');

  if (prefersReducedMotion || !('IntersectionObserver' in window)) {
    revealEls.forEach(function (el) { el.classList.add('is-visible'); });
  } else {
    var revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          entry.target.querySelectorAll('[data-count]').forEach(countUp);
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

    revealEls.forEach(function (el) { revealObserver.observe(el); });
  }

  /* ---------- Subtle hero parallax (decorative layer only) ---------- */

  var heroFrame = document.querySelector('.hero-frame');

  if (heroFrame && !prefersReducedMotion && window.matchMedia('(min-width: 900px)').matches) {
    var parallaxPending = false;
    window.addEventListener('scroll', function () {
      if (parallaxPending) return;
      parallaxPending = true;
      requestAnimationFrame(function () {
        var y = Math.min(window.scrollY, 900);
        heroFrame.style.transform = 'translateY(' + (y * 0.08).toFixed(1) + 'px)';
        parallaxPending = false;
      });
    }, { passive: true });
  }

  /* ---------- Active nav-link highlighting (same-page anchors) ---------- */

  var navLinks = Array.prototype.slice.call(
    siteNav.querySelectorAll('a[href^="#"]:not(.btn)')
  );
  var sections = navLinks
    .map(function (link) { return document.querySelector(link.getAttribute('href')); })
    .filter(Boolean);

  if ('IntersectionObserver' in window && sections.length) {
    var currentId = null;

    var sectionObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) currentId = '#' + entry.target.id;
      });
      navLinks.forEach(function (link) {
        if (link.getAttribute('href') === currentId) {
          link.setAttribute('aria-current', 'true');
        } else {
          link.removeAttribute('aria-current');
        }
      });
    }, { rootMargin: '-30% 0px -60% 0px' });

    sections.forEach(function (section) { sectionObserver.observe(section); });
  }

  /* ---------- Scroll progress bar ---------- */

  var progressBar = document.createElement('div');
  progressBar.className = 'scroll-progress';
  progressBar.setAttribute('aria-hidden', 'true');
  document.body.appendChild(progressBar);

  var progressPending = false;
  function updateProgress() {
    var max = document.documentElement.scrollHeight - window.innerHeight;
    progressBar.style.transform = 'scaleX(' + (max > 0 ? window.scrollY / max : 0) + ')';
  }
  window.addEventListener('scroll', function () {
    if (progressPending) return;
    progressPending = true;
    requestAnimationFrame(function () { updateProgress(); progressPending = false; });
  }, { passive: true });
  updateProgress();

  /* ---------- GSAP choreography (progressive enhancement) ---------- */

  var gsapReady = typeof window.gsap !== 'undefined' &&
                  typeof window.ScrollTrigger !== 'undefined' &&
                  !prefersReducedMotion;

  if (gsapReady) {
    gsap.registerPlugin(ScrollTrigger);
    document.documentElement.classList.add('gsap');

    // 1. Headline word-cascade: each word rises out of its own mask.
    var headline = document.querySelector('.hero h1, .page-hero h1');
    if (headline) {
      headline.classList.remove('reveal');
      headline.classList.add('is-visible');
      var words = headline.textContent.trim().split(/\s+/);
      headline.innerHTML = words
        .map(function (w) { return '<span class="w"><span>' + w + '</span></span>'; })
        .join(' ');
      gsap.from(headline.querySelectorAll('.w > span'), {
        yPercent: 115,
        rotate: 3,
        duration: 0.9,
        stagger: 0.055,
        ease: 'expo.out',
        delay: 0.15
      });
    }

    // 2a. Aperture reveal: every photo opens up from its center as it enters the viewport.
    document.querySelectorAll(
      '.photo-frame img, .hero-photo img, .news-card-thumb img, .news-featured-photo img'
    ).forEach(function (img) {
      var frame = img.closest('.photo-frame, .hero-photo, .news-card-thumb, .news-featured-photo');
      gsap.fromTo(img,
        { clipPath: 'inset(16% 16% 16% 16%)', opacity: 0.3 },
        {
          clipPath: 'inset(0% 0% 0% 0%)',
          opacity: 1,
          duration: 1.25,
          ease: 'power3.out',
          scrollTrigger: { trigger: frame, start: 'top 88%', once: true }
        });
    });

    // 2b. Photos pan vertically inside their frames as the page scrolls (parallax scrub).
    document.querySelectorAll('.photo-frame img, .hero-photo img, .news-featured-photo img').forEach(function (img) {
      var frame = img.closest('.photo-frame, .hero-photo, .news-featured-photo');
      gsap.fromTo(img,
        { yPercent: -11, scale: 1.24 },
        {
          yPercent: 11,
          scale: 1.24,
          ease: 'none',
          scrollTrigger: { trigger: frame, start: 'top bottom', end: 'bottom top', scrub: 0.4 }
        });
    });

    // 3. Magnetic pull on the primary CTAs (skill: clamp pull, focal elements only).
    if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
      document.querySelectorAll('.btn-gold, .nav-cta').forEach(function (btn) {
        var xTo = gsap.quickTo(btn, 'x', { duration: 0.4, ease: 'power3.out' });
        var yTo = gsap.quickTo(btn, 'y', { duration: 0.4, ease: 'power3.out' });
        btn.addEventListener('mousemove', function (e) {
          var r = btn.getBoundingClientRect();
          xTo((e.clientX - r.left - r.width / 2) * 0.28);
          yTo((e.clientY - r.top - r.height / 2) * 0.4);
        });
        btn.addEventListener('mouseleave', function () {
          gsap.to(btn, { x: 0, y: 0, duration: 0.7, ease: 'elastic.out(1, 0.45)' });
        });
      });
    }
  }

  /* ---------- Interactive world map (markets section) ---------- */

  var worldPanel = document.getElementById('world-panel');

  if (worldPanel) {
    var ORIGIN = { r: 'us', n: 'California — Origin', lat: 36.8, lon: -119.8 };
    var MARKETS = [
      { r: 'us', n: 'United States', lat: 39.8, lon: -98.6 },
      { r: 'na', n: 'Canada', lat: 53.9, lon: -106.3 },
      { r: 'na', n: 'Mexico', lat: 23.6, lon: -102.5 },
      { r: 'ap', n: 'Vietnam', lat: 16.2, lon: 106.0 },
      { r: 'ap', n: 'China', lat: 34.5, lon: 104.0 },
      { r: 'ap', n: 'Hong Kong', lat: 22.3, lon: 114.2 },
      { r: 'ap', n: 'Japan', lat: 36.2, lon: 138.3 },
      { r: 'ap', n: 'South Korea', lat: 36.5, lon: 127.9 },
      { r: 'ap', n: 'Taiwan', lat: 23.7, lon: 121.0 },
      { r: 'ap', n: 'Singapore', lat: 1.35, lon: 103.8 },
      { r: 'ap', n: 'Malaysia', lat: 3.9, lon: 102.0 },
      { r: 'ap', n: 'Indonesia', lat: -2.5, lon: 117.9 },
      { r: 'ap', n: 'Thailand', lat: 15.0, lon: 101.0 },
      { r: 'ap', n: 'Philippines', lat: 12.9, lon: 122.0 },
      { r: 'sa', n: 'India', lat: 21.0, lon: 78.0 },
      { r: 'sa', n: 'Pakistan', lat: 29.9, lon: 69.4 },
      { r: 'sa', n: 'Bangladesh', lat: 23.7, lon: 90.4 },
      { r: 'sa', n: 'Sri Lanka', lat: 7.9, lon: 80.8 },
      { r: 'me', n: 'United Arab Emirates', lat: 24.3, lon: 54.4 },
      { r: 'me', n: 'Saudi Arabia', lat: 23.9, lon: 45.1 },
      { r: 'me', n: 'Qatar', lat: 25.3, lon: 51.2 },
      { r: 'me', n: 'Kuwait', lat: 29.3, lon: 47.5 },
      { r: 'me', n: 'Bahrain', lat: 26.0, lon: 50.5 },
      { r: 'me', n: 'Oman', lat: 21.5, lon: 57.0 },
      { r: 'me', n: 'Jordan', lat: 31.3, lon: 36.4 },
      { r: 'eu', n: 'Germany', lat: 51.1, lon: 10.4 },
      { r: 'eu', n: 'Netherlands', lat: 52.2, lon: 5.3 },
      { r: 'eu', n: 'Spain', lat: 40.2, lon: -3.7 },
      { r: 'eu', n: 'Italy', lat: 42.8, lon: 12.5 },
      { r: 'eu', n: 'France', lat: 46.6, lon: 2.5 },
      { r: 'eu', n: 'United Kingdom', lat: 53.0, lon: -1.5 }
    ];
    // One arc from California to a hub country per region.
    var HUBS = {
      na: { lat: 23.6, lon: -102.5 },
      ap: { lat: 16.2, lon: 106.0 },
      sa: { lat: 21.0, lon: 78.0 },
      me: { lat: 24.3, lon: 54.4 },
      eu: { lat: 51.1, lon: 10.4 }
    };

    // Equirectangular projection → percentages of the 800×400 map.
    function project(pt) {
      return { x: (pt.lon + 180) / 360 * 100, y: (90 - pt.lat) / 180 * 100 };
    }

    var pinsLayer = worldPanel.querySelector('.world-pins');
    var arcsSvg = worldPanel.querySelector('.world-arcs');

    function addPin(pt, isOrigin) {
      var p = project(pt);
      var pin = document.createElement('span');
      pin.className = 'map-pin' + (isOrigin ? ' map-pin-origin' : '');
      pin.style.left = p.x.toFixed(2) + '%';
      pin.style.top = p.y.toFixed(2) + '%';
      pin.setAttribute('data-name', pt.n);
      pin.dataset.region = pt.r;
      pinsLayer.appendChild(pin);
    }

    MARKETS.forEach(function (pt) { addPin(pt, false); });
    addPin(ORIGIN, true);

    var o = project(ORIGIN);
    Object.keys(HUBS).forEach(function (region) {
      var h = project(HUBS[region]);
      var x1 = o.x * 8, y1 = o.y * 4, x2 = h.x * 8, y2 = h.y * 4;
      var mx = (x1 + x2) / 2;
      var my = Math.max(8, Math.min(y1, y2) - Math.abs(x2 - x1) * 0.18 - 20);
      var arc = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      arc.setAttribute('d', 'M' + x1.toFixed(1) + ' ' + y1.toFixed(1) +
                            ' Q' + mx.toFixed(1) + ' ' + my.toFixed(1) +
                            ' ' + x2.toFixed(1) + ' ' + y2.toFixed(1));
      arc.setAttribute('class', 'world-arc');
      arc.dataset.region = region;
      arcsSvg.appendChild(arc);
    });

    // Hovering (or focusing) a region chip spotlights its markets on the map.
    document.querySelectorAll('.region-chips [data-region], .market-card[data-region]').forEach(function (chip) {
      var region = chip.dataset.region;

      function spotlight() {
        chip.classList.add('active');
        worldPanel.classList.add('hl');
        worldPanel.querySelectorAll('[data-region]').forEach(function (el) {
          el.classList.toggle('hot', el.dataset.region === region);
        });
      }
      function clear() {
        chip.classList.remove('active');
        worldPanel.classList.remove('hl');
        worldPanel.querySelectorAll('.hot').forEach(function (el) {
          el.classList.remove('hot');
        });
      }

      chip.addEventListener('mouseenter', spotlight);
      chip.addEventListener('mouseleave', clear);
      chip.addEventListener('focusin', spotlight);
      chip.addEventListener('focusout', clear);
    });
  }

  /* ---------- Sourcing slider ---------- */

  var slider = document.getElementById('sourcing-slider');

  if (slider) {
    var sliderTrack = slider.querySelector('.slider-track');
    var slides = sliderTrack.children;
    var dotsWrap = slider.querySelector('.slider-dots');
    var currentSlide = 0;
    var sliderTimer = null;

    for (var s = 0; s < slides.length; s++) {
      (function (idx) {
        var dot = document.createElement('button');
        dot.type = 'button';
        dot.setAttribute('aria-label', 'Go to slide ' + (idx + 1));
        dot.addEventListener('click', function () { goToSlide(idx); restartAutoplay(); });
        dotsWrap.appendChild(dot);
      })(s);
    }
    var dots = dotsWrap.children;

    function goToSlide(i) {
      currentSlide = (i + slides.length) % slides.length;
      sliderTrack.style.transform = 'translateX(-' + (currentSlide * 100) + '%)';
      for (var d = 0; d < dots.length; d++) {
        dots[d].classList.toggle('active', d === currentSlide);
      }
    }

    slider.querySelector('.slider-prev').addEventListener('click', function () {
      goToSlide(currentSlide - 1);
      restartAutoplay();
    });
    slider.querySelector('.slider-next').addEventListener('click', function () {
      goToSlide(currentSlide + 1);
      restartAutoplay();
    });

    function startAutoplay() {
      if (prefersReducedMotion || sliderTimer) return;
      sliderTimer = setInterval(function () { goToSlide(currentSlide + 1); }, 5000);
    }
    function stopAutoplay() {
      if (sliderTimer) { clearInterval(sliderTimer); sliderTimer = null; }
    }
    function restartAutoplay() { stopAutoplay(); startAutoplay(); }

    slider.addEventListener('mouseenter', stopAutoplay);
    slider.addEventListener('mouseleave', startAutoplay);
    slider.addEventListener('focusin', stopAutoplay);
    slider.addEventListener('focusout', startAutoplay);

    // Simple swipe support.
    var swipeStartX = null;
    slider.addEventListener('pointerdown', function (e) { swipeStartX = e.clientX; });
    slider.addEventListener('pointerup', function (e) {
      if (swipeStartX === null) return;
      var dx = e.clientX - swipeStartX;
      if (Math.abs(dx) > 40) {
        goToSlide(currentSlide + (dx < 0 ? 1 : -1));
        restartAutoplay();
      }
      swipeStartX = null;
    });
    Array.prototype.forEach.call(slider.querySelectorAll('img'), function (img) {
      img.draggable = false;
    });

    goToSlide(0);
    startAutoplay();
  }

  /* ---------- 3D tilt on cards (fine pointers only) ---------- */

  if (!prefersReducedMotion && window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    document.querySelectorAll('.why-card, .market-card, .news-card').forEach(function (card) {
      card.addEventListener('mousemove', function (e) {
        var r = card.getBoundingClientRect();
        var rx = ((e.clientY - r.top) / r.height - 0.5) * -5;
        var ry = ((e.clientX - r.left) / r.width - 0.5) * 5;
        card.style.transform =
          'perspective(900px) translateY(-4px) rotateX(' + rx.toFixed(2) + 'deg) rotateY(' + ry.toFixed(2) + 'deg)';
      });
      card.addEventListener('mouseleave', function () {
        card.style.transform = '';
      });
    });
  }

  /* ---------- Shared form helpers ---------- */

  function validateField(field) {
    var isValid = field.checkValidity();
    field.classList.toggle('field-invalid', !isValid);
    return isValid;
  }

  function validateRequired(form, errorEl) {
    var requiredFields = Array.prototype.slice.call(form.querySelectorAll('[required]'));
    var allValid = requiredFields
      .map(validateField)
      .every(function (valid) { return valid; });

    if (!allValid) {
      if (errorEl) errorEl.hidden = false;
      var firstInvalid = form.querySelector('.field-invalid');
      if (firstInvalid) firstInvalid.focus();
    } else if (errorEl) {
      errorEl.hidden = true;
    }
    return allValid;
  }

  function clearInvalidOnInput(form, errorEl) {
    form.addEventListener('input', function (event) {
      var field = event.target;
      if (field.classList.contains('field-invalid') && field.checkValidity()) {
        field.classList.remove('field-invalid');
        if (errorEl && !form.querySelector('.field-invalid')) errorEl.hidden = true;
      }
    });
  }

  function showSuccess(form, successPanel) {
    form.hidden = true;
    successPanel.hidden = false;
    successPanel.scrollIntoView({
      behavior: prefersReducedMotion ? 'auto' : 'smooth',
      block: 'center'
    });
  }

  /* ---------- Quote form (index page) ---------- */

  var quoteForm = document.getElementById('quote-form');

  if (quoteForm) {
    var quoteError = document.getElementById('form-error');
    var quoteSuccess = document.getElementById('quote-success');
    var quoteDetail = document.getElementById('quote-success-detail');
    var quoteReset = document.getElementById('quote-reset');

    quoteForm.addEventListener('submit', function (event) {
      event.preventDefault();
      if (!validateRequired(quoteForm, quoteError)) return;

      // Build a short recap of the request for the confirmation panel.
      var variety = quoteForm.variety.value;
      var volume = quoteForm.volume.value.trim();
      var destination = quoteForm.destination.value.trim();
      quoteDetail.textContent =
        'We received your request for ' + variety +
        (volume ? ' — ' + volume : '') +
        (destination ? ', destined for ' + destination : '') +
        '. Our team will review your requirements and prepare a commercial quotation ' +
        'based on current availability and market conditions.';

      showSuccess(quoteForm, quoteSuccess);
    });

    clearInvalidOnInput(quoteForm, quoteError);

    quoteReset.addEventListener('click', function () {
      quoteForm.reset();
      quoteForm.hidden = false;
      quoteSuccess.hidden = true;
      quoteForm.querySelector('input, select').focus();
    });
  }

  /* ---------- Contact form (contact page) ---------- */

  var contactForm = document.getElementById('contact-form');

  if (contactForm) {
    var contactError = document.getElementById('contact-error');
    var contactSuccess = document.getElementById('contact-success');
    var contactReset = document.getElementById('contact-reset');

    contactForm.addEventListener('submit', function (event) {
      event.preventDefault();
      if (!validateRequired(contactForm, contactError)) return;
      showSuccess(contactForm, contactSuccess);
    });

    clearInvalidOnInput(contactForm, contactError);

    if (contactReset) {
      contactReset.addEventListener('click', function () {
        contactForm.reset();
        contactForm.hidden = false;
        contactSuccess.hidden = true;
        contactForm.querySelector('input, select').focus();
      });
    }
  }

  /* ---------- Newsletter form (news page) ---------- */

  var newsletterForm = document.getElementById('newsletter-form');

  if (newsletterForm) {
    var newsletterSuccess = document.getElementById('newsletter-success');

    newsletterForm.addEventListener('submit', function (event) {
      event.preventDefault();
      var email = newsletterForm.querySelector('input[type="email"]');
      if (!validateField(email)) { email.focus(); return; }
      newsletterForm.hidden = true;
      newsletterSuccess.hidden = false;
    });

    clearInvalidOnInput(newsletterForm, null);
  }

  /* ---------- Footer year ---------- */

  var yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();
})();
