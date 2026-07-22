/**
 * Suparna Studio — Shared JavaScript
 * Component loader, mobile menu, active nav, lightbox
 */

(function () {
  'use strict';

  var lightboxImages = [];
  var lightboxIndex = 0;
  var navInitialized = false;

  async function loadComponent(targetId, path) {
    var target = document.getElementById(targetId);
    if (!target) return;

    try {
      var response = await fetch(path);
      if (!response.ok) throw new Error('Failed to load ' + path);
      var html = await response.text();
      target.innerHTML = html;
      initAfterComponentsLoaded();
    } catch (err) {
      console.warn('Component load failed (use a local server):', err.message);
    }
  }

  function setActiveNavLink() {
    var path = window.location.pathname;
    var page = path.split('/').pop().replace('.html', '') || 'index';

    document.querySelectorAll('.nav-link[data-page]').forEach(function (link) {
      var linkPage = link.getAttribute('data-page');
      link.classList.toggle('active', linkPage === page);
    });
  }

  function initMobileMenu() {
    var toggle = document.getElementById('menu-toggle');
    var menu = document.getElementById('mobile-menu');
    if (!toggle || !menu) return;

    toggle.addEventListener('click', function () {
      var isOpen = menu.classList.toggle('open');
      toggle.classList.toggle('open', isOpen);
      toggle.setAttribute('aria-expanded', isOpen);
    });

    menu.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        menu.classList.remove('open');
        toggle.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  function initNavbarScroll() {
    var header = document.getElementById('site-nav');
    if (!header) return;

    function onScroll() {
      header.classList.toggle('scrolled', window.scrollY > 20);
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  function createLightboxElement() {
    if (document.getElementById('lightbox')) return;

    var lightbox = document.createElement('div');
    lightbox.id = 'lightbox';
    lightbox.className = 'lightbox';
    lightbox.setAttribute('role', 'dialog');
    lightbox.setAttribute('aria-modal', 'true');
    lightbox.setAttribute('aria-label', 'Image preview');
    lightbox.innerHTML =
      '<button type="button" class="lightbox-close" aria-label="Close preview">' +
      '<svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>' +
      '</button>' +
      '<button type="button" class="lightbox-prev" aria-label="Previous image">' +
      '<svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/></svg>' +
      '</button>' +
      '<button type="button" class="lightbox-next" aria-label="Next image">' +
      '<svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>' +
      '</button>' +
      '<div class="lightbox-content">' +
      '<img id="lightbox-img" src="" alt="">' +
      '<p id="lightbox-caption" class="lightbox-caption"></p>' +
      '</div>';

    document.body.appendChild(lightbox);

    lightbox.querySelector('.lightbox-close').addEventListener('click', closeLightbox);
    lightbox.querySelector('.lightbox-prev').addEventListener('click', showPrevImage);
    lightbox.querySelector('.lightbox-next').addEventListener('click', showNextImage);
    lightbox.addEventListener('click', function (e) {
      if (e.target === lightbox) closeLightbox();
    });
  }

  function openLightbox(index) {
    var lightbox = document.getElementById('lightbox');
    if (!lightbox || !lightboxImages.length) return;

    lightboxIndex = index;
    updateLightboxImage();
    lightbox.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeLightbox() {
    var lightbox = document.getElementById('lightbox');
    if (!lightbox) return;

    lightbox.classList.remove('open');
    document.body.style.overflow = '';
  }

  function updateLightboxImage() {
    var img = document.getElementById('lightbox-img');
    var caption = document.getElementById('lightbox-caption');
    var item = lightboxImages[lightboxIndex];

    if (!img || !item) return;

    img.src = item.src;
    img.alt = item.alt;
    if (caption) {
      caption.textContent = item.caption || item.alt;
    }
  }

  function showPrevImage() {
    lightboxIndex = (lightboxIndex - 1 + lightboxImages.length) % lightboxImages.length;
    updateLightboxImage();
  }

  function showNextImage() {
    lightboxIndex = (lightboxIndex + 1) % lightboxImages.length;
    updateLightboxImage();
  }

  function initLightbox() {
    var gallery = document.querySelector('.lightbox-gallery');
    if (!gallery) return;

    createLightboxElement();
    lightboxImages = [];

    gallery.querySelectorAll('.lightbox-trigger').forEach(function (trigger, index) {
      lightboxImages.push({
        src: trigger.getAttribute('data-full') || trigger.querySelector('img').src,
        alt: trigger.getAttribute('data-alt') || trigger.querySelector('img').alt,
        caption: trigger.getAttribute('data-caption') || '',
      });

      trigger.addEventListener('click', function () {
        openLightbox(index);
      });
    });

    document.addEventListener('keydown', function (e) {
      var lightbox = document.getElementById('lightbox');
      if (!lightbox || !lightbox.classList.contains('open')) return;

      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowLeft') showPrevImage();
      if (e.key === 'ArrowRight') showNextImage();
    });
  }

  function setInstagramLink(urlKey, handleKey, url, handle) {
    var link = document.querySelector('[data-site="' + urlKey + '"]');
    var span = document.querySelector('[data-site="' + handleKey + '"]');
    if (link) link.href = url;
    if (span) span.textContent = handle;
  }

  function applySiteConfig() {
    var c = window.SITE_CONFIG;
    if (!c) return;

    document.querySelectorAll('[data-site="email-url"]').forEach(function (el) {
      el.href = 'mailto:' + c.email;
      el.textContent = c.email;
    });
    document.querySelectorAll('[data-site="email"]').forEach(function (el) {
      el.textContent = c.email;
    });
    document.querySelectorAll('[data-site="city"]').forEach(function (el) {
      el.textContent = 'Available for on-location sessions. Based in ' + c.city + '.';
    });
    document.querySelectorAll('[data-site="whatsapp-url"]').forEach(function (el) {
      el.href = c.whatsappUrl;
    });

    var accessKey = document.querySelector('input[name="access_key"]');
    if (accessKey && c.web3formsKey) accessKey.value = c.web3formsKey;

    var redirect = document.querySelector('input[name="redirect"]');
    if (redirect && c.formRedirect) redirect.value = c.formRedirect;
  }

  function initAfterComponentsLoaded() {
    setActiveNavLink();
    applySiteConfig();
    if (!navInitialized && document.getElementById('menu-toggle')) {
      initMobileMenu();
      initNavbarScroll();
      navInitialized = true;
    }
  }

  document.addEventListener('DOMContentLoaded', function () {
    applySiteConfig();
    loadComponent('site-header', 'components/navbar.html');
    loadComponent('site-footer', 'components/footer.html');
    initLightbox();
  });
})();
