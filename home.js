(function () {
  'use strict';
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Hero: self-playing 3D cover showcase ---------- */
  var stage = $('#stage'), books = $$('#deck .book'), n = books.length;
  var caption = $('#caption'), dotsWrap = $('#dots'), playBtn = $('#play');
  if (stage && n) {
    var active = 0, timer = null, playing = !reduce, userPaused = reduce, hover = false, prevOffsets = [];
    var dots = books.map(function (b, i) {
      var d = document.createElement('button'); d.type = 'button'; d.className = 'dot';
      d.setAttribute('aria-label', 'Show ' + b.dataset.title);
      d.addEventListener('click', function () { go(i, true); });
      dotsWrap.insertBefore(d, playBtn); return d;
    });
    var signed = function (i, a) { var half = Math.floor(n / 2); return ((i - a + n + half) % n) - half; };
    var layout = function (first) {
      var stageW = stage.clientWidth, h = books[0].offsetHeight || 300;
      var unit = Math.min(stageW * 0.27, h * 0.62);
      books.forEach(function (b, i) {
        var o = signed(i, active), ao = Math.abs(o);
        var x = (o < 0 ? -1 : 1) * (ao === 0 ? 0 : (ao === 1 ? unit * 1.22 : unit * 2.0));
        var z = -ao * 140, r = -o * 40, s = ao === 0 ? 1.14 : (ao === 1 ? 0.92 : 0.78);
        var op = ao === 0 ? 1 : (ao === 1 ? 0.95 : 0.55);
        var jump = !first && prevOffsets[i] !== undefined && Math.abs(prevOffsets[i] - o) > 2;
        if (jump) { b.style.transition = 'none'; }
        b.style.transform = 'translate(-50%,-50%) translateX(' + x + 'px) translateZ(' + z + 'px) rotateY(' + r + 'deg) scale(' + s + ')';
        b.style.opacity = op; b.style.zIndex = 10 - ao;
        b.style.filter = ao === 0 ? 'none' : 'saturate(.9) brightness(.96)';
        if (jump) { void b.offsetWidth; b.style.transition = ''; }
        prevOffsets[i] = o;
      });
      var cur = books[active];
      caption.innerHTML = '<strong></strong><span></span><span></span>';
      caption.children[0].textContent = cur.dataset.title;
      caption.children[1].textContent = cur.dataset.author;
      caption.children[2].textContent = cur.dataset.role;
      dots.forEach(function (d, i) { d.setAttribute('aria-current', i === active ? 'true' : 'false'); });
    };
    var go = function (i, fromUser) { active = ((i % n) + n) % n; layout(); if (fromUser) { restart(); } };
    var tick = function () { if (playing && !hover && !document.hidden) { go(active + 1); } };
    var restart = function () { clearInterval(timer); if (playing) { timer = setInterval(tick, 2000); } };
    var setPlaying = function (p, byUser) {
      playing = p; if (byUser) { userPaused = !p; }
      playBtn.setAttribute('aria-pressed', p ? 'false' : 'true');
      playBtn.setAttribute('aria-label', p ? 'Pause the showcase' : 'Play the showcase');
      restart();
    };
    playBtn.addEventListener('click', function () { setPlaying(!playing, true); });
    stage.addEventListener('mouseenter', function () { hover = true; });
    stage.addEventListener('mouseleave', function () { hover = false; });
    stage.addEventListener('focusin', function () { hover = true; });
    stage.addEventListener('focusout', function () { hover = false; });
    stage.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowRight') { go(active + 1, true); e.preventDefault(); }
      if (e.key === 'ArrowLeft') { go(active - 1, true); e.preventDefault(); }
      if (e.key === 'Enter' && books[active].dataset.href) { window.location.href = books[active].dataset.href; }
    });
    books.forEach(function (b, i) {
      b.addEventListener('click', function () {
        if (i !== active) { go(i, true); } else if (b.dataset.href) { window.location.href = b.dataset.href; }
      });
    });
    var sx = null;
    stage.addEventListener('pointerdown', function (e) { sx = e.clientX; });
    stage.addEventListener('pointerup', function (e) {
      if (sx === null) return; var dx = e.clientX - sx; sx = null;
      if (Math.abs(dx) > 40) { go(active + (dx < 0 ? 1 : -1), true); }
    });
    document.addEventListener('visibilitychange', restart);
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (es) { if (!es[0].isIntersecting) { clearInterval(timer); } else { restart(); } }, { threshold: 0.15 }).observe(stage);
    }
    var ready = function () { layout(true); setPlaying(!userPaused, false); };
    if (document.readyState === 'complete') { ready(); } else { window.addEventListener('load', ready); layout(true); }
    window.addEventListener('resize', function () { layout(true); });
  }

  /* ---------- Edit demo: switches between examples that are already in the HTML ---------- */
  var demo = $('#demo');
  if (demo) {
    var tabs = $$('.demo-tab', demo), panels = $$('.demo-panel', demo);
    var showPanel = function (i) {
      tabs.forEach(function (t, k) { t.setAttribute('aria-selected', k === i ? 'true' : 'false'); t.tabIndex = k === i ? 0 : -1; });
      panels.forEach(function (p, k) { p.hidden = k !== i; });
    };
    tabs.forEach(function (t, i) { t.addEventListener('click', function () { showPanel(i); }); });
    panels.forEach(function (p) {
      var btns = $$('.view-switch button', p), views = $$('.view', p);
      btns.forEach(function (b) {
        b.addEventListener('click', function () {
          btns.forEach(function (x) { x.setAttribute('aria-pressed', x === b ? 'true' : 'false'); });
          views.forEach(function (v) { v.hidden = v.getAttribute('data-view') !== b.getAttribute('data-view'); });
        });
      });
    });
    showPanel(0);
  }

  /* ---------- Work filters ---------- */
  $$('.filter').forEach(function (f) {
    f.addEventListener('click', function () {
      $$('.filter').forEach(function (x) { x.setAttribute('aria-pressed', 'false'); });
      f.setAttribute('aria-pressed', 'true');
      var k = f.dataset.f;
      $$('.work-card').forEach(function (c) { c.hidden = !(k === 'all' || c.dataset.cat.split(' ').indexOf(k) > -1); });
    });
  });

  /* ---------- Request form (opens your email or WhatsApp with the message filled in) ---------- */
  var form = $('#requestForm'), msg = $('#formMsg'), via = 'email';
  if (form) {
    $$('button[type="submit"]', form).forEach(function (b) { b.addEventListener('click', function () { via = b.dataset.via; }); });
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var v = function (id) { return $(id).value.trim(); };
      var name = v('#f-name'), email = v('#f-email');
      msg.className = 'form-msg';
      if (!name) { msg.textContent = 'Add your name so I know who to reply to.'; msg.className = 'form-msg err'; $('#f-name').focus(); return; }
      if (via === 'email' && !/^\S+@\S+\.\S+$/.test(email)) { msg.textContent = 'Add a valid email address so I can reply to you.'; msg.className = 'form-msg err'; $('#f-email').focus(); return; }
      var lines = ['Hi Tijani, I’d like a free sample edit.', '', 'Name: ' + name];
      if (email) lines.push('Email: ' + email);
      if (v('#f-genre')) lines.push('Genre: ' + v('#f-genre'));
      if (v('#f-words')) lines.push('Word count: ' + v('#f-words'));
      lines.push('I need: ' + $('#f-service').value);
      if (v('#f-msg')) lines.push('', 'About my book:', v('#f-msg'));
      var body = lines.join('\n');
      if (via === 'wa') {
        window.open('https://wa.me/2348136720953?text=' + encodeURIComponent(body), '_blank', 'noopener');
        msg.textContent = 'WhatsApp is opening with your message ready to send.'; msg.className = 'form-msg ok';
      } else {
        window.location.href = 'mailto:tijaniuthmanbooks@gmail.com?subject=' + encodeURIComponent('Free sample edit request from ' + name) + '&body=' + encodeURIComponent(body);
        msg.textContent = 'Your email app is opening. Attach your first 500 words and press send.'; msg.className = 'form-msg ok';
      }
    });
  }
})();
