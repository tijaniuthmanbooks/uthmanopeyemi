(function () {
  'use strict';
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  /* Mobile menu */
  var menuBtn = $('#menuBtn'), navLinks = $('#navLinks');
  if (menuBtn && navLinks) {
    menuBtn.addEventListener('click', function () {
      var open = navLinks.classList.toggle('open');
      menuBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    $$('#navLinks a').forEach(function (a) {
      a.addEventListener('click', function () {
        navLinks.classList.remove('open');
        menuBtn.setAttribute('aria-expanded', 'false');
      });
    });
  }

  /* Highlight the nav link of the section being read (home page only) */
  if ('IntersectionObserver' in window) {
    var map = {};
    $$('#navLinks a[data-section]').forEach(function (a) { map[a.getAttribute('data-section')] = a; });
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (e.isIntersecting && map[e.target.id]) {
          $$('#navLinks a').forEach(function (a) { a.removeAttribute('aria-current'); });
          map[e.target.id].setAttribute('aria-current', 'true');
        }
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    Object.keys(map).forEach(function (id) { var el = document.getElementById(id); if (el) io.observe(el); });
  }

  /* Formatting portfolio: show the first 8 cards, then reveal the rest (all visible without JS) */
  var grid = $('#pfGrid'), more = $('#pfMore'), wrap = $('#pfMoreWrap');
  if (grid && more && wrap) {
    var limit = parseInt(grid.getAttribute('data-limit'), 10) || 8;
    if (grid.children.length > limit) {
      grid.classList.add('is-collapsed'); wrap.hidden = false;
      more.addEventListener('click', function () { grid.classList.remove('is-collapsed'); wrap.hidden = true; });
    }
  }
})();
