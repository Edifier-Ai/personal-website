(function () {
  'use strict';

  document.documentElement.classList.add('js');

  var fine = window.matchMedia('(pointer: fine)').matches;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- 阅读进度（rAF 节流） ---------- */
  var bar = document.getElementById('bar');
  var pval = document.getElementById('progress-value');
  var scrollTicking = false;
  function updateProgress() {
    scrollTicking = false;
    var h = document.documentElement;
    var max = h.scrollHeight - h.clientHeight;
    var p = max > 0 ? h.scrollTop / max : 0;
    if (bar) bar.style.transform = 'scaleX(' + p.toFixed(4) + ')';
    if (pval) pval.textContent = String(Math.round(p * 100)).padStart(2, '0');
  }
  document.addEventListener('scroll', function () {
    if (!scrollTicking) {
      scrollTicking = true;
      requestAnimationFrame(updateProgress);
    }
  }, { passive: true });
  window.addEventListener('resize', function () {
    if (!scrollTicking) {
      scrollTicking = true;
      requestAnimationFrame(updateProgress);
    }
  }, { passive: true });
  updateProgress();

  /* ---------- 可深链、可键盘操作的 tab ---------- */
  var tabs = Array.prototype.slice.call(document.querySelectorAll('.tab[role="tab"]'));
  var panels = Array.prototype.slice.call(document.querySelectorAll('.panel[role="tabpanel"]'));

  function activateTab(tab, updateHash, moveFocus) {
    if (!tab) return;
    tabs.forEach(function (other) {
      var selected = other === tab;
      other.classList.toggle('active', selected);
      other.setAttribute('aria-selected', selected ? 'true' : 'false');
      other.tabIndex = selected ? 0 : -1;
    });
    panels.forEach(function (panel) {
      var selected = panel.id === tab.getAttribute('aria-controls');
      panel.classList.toggle('active', selected);
      panel.hidden = !selected;
    });

    var panel = document.getElementById(tab.getAttribute('aria-controls'));
    if (panel) {
      void panel.offsetWidth;
      panel.classList.add('active');
    }
    if (moveFocus) tab.focus();

    var hash = tab.getAttribute('data-hash');
    if (updateHash && hash && window.history && window.history.pushState) {
      window.history.pushState(null, '', '#' + hash);
    }
  }

  function tabFromHash() {
    var hash = window.location.hash.replace(/^#/, '');
    return tabs.find(function (tab) { return tab.getAttribute('data-hash') === hash; });
  }

  if (tabs.length) {
    tabs.forEach(function (tab, index) {
      tab.addEventListener('click', function () { activateTab(tab, true, false); });
      tab.addEventListener('keydown', function (event) {
        var next = index;
        if (event.key === 'ArrowRight' || event.key === 'ArrowDown') next = (index + 1) % tabs.length;
        else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') next = (index - 1 + tabs.length) % tabs.length;
        else if (event.key === 'Home') next = 0;
        else if (event.key === 'End') next = tabs.length - 1;
        else return;
        event.preventDefault();
        activateTab(tabs[next], true, true);
      });
    });
    activateTab(tabFromHash() || tabs.find(function (tab) { return tab.classList.contains('active'); }) || tabs[0], false, false);
    window.addEventListener('hashchange', function () {
      var tab = tabFromHash();
      if (tab) activateTab(tab, false, false);
    });
  }

  /* ---------- 滚动显现：无 JS 时内容默认可见 ---------- */
  var reveals = Array.prototype.slice.call(document.querySelectorAll('.reveal'));
  var firstHero = document.querySelector('.hero.reveal');
  if (firstHero) firstHero.classList.add('in');
  if (reduce || !('IntersectionObserver' in window)) {
    reveals.forEach(function (el) { el.classList.add('in'); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('in');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    reveals.forEach(function (el) { io.observe(el); });
  }

  /* ---------- 自定义光标 ---------- */
  var cursor = document.getElementById('cursor');
  var rawX = window.innerWidth / 2;
  var rawY = window.innerHeight / 2;
  var curX = rawX;
  var curY = rawY;

  window.addEventListener('pointermove', function (event) {
    rawX = event.clientX;
    rawY = event.clientY;
    if (cursor && fine && !reduce) document.body.classList.add('cursor-on');
  }, { passive: true });
  document.addEventListener('mouseover', function (event) {
    if (!cursor) return;
    var hot = event.target.closest && event.target.closest('a, button, .chip, .wife');
    cursor.classList.toggle('is-hover', !!hot);
  });

  function cursorLoop() {
    if (cursor && fine && !reduce) {
      curX += (rawX - curX) * 0.18;
      curY += (rawY - curY) * 0.18;
      cursor.style.transform = 'translate(' + curX + 'px,' + curY + 'px) translate(-50%,-50%)';
      requestAnimationFrame(cursorLoop);
    }
  }
  if (cursor && fine && !reduce) requestAnimationFrame(cursorLoop);

  /* ---------- 家属菜单 ---------- */
  var wife = document.querySelector('.scene-wife-menu');
  var toast = document.getElementById('toast');
  var timer = null;
  var lines = [
    '她回头了：先来认识一下 summer2077。',
    '家属监工中，今天也要按时下班。',
    '她说这个主页做得还行，勉强及格。'
  ];
  var lineIdx = 0;
  if (wife && toast) {
    wife.addEventListener('click', function (event) {
      var touchLike = window.matchMedia('(hover: none), (pointer: coarse)').matches;
      if (touchLike && !wife.classList.contains('is-revealed')) {
        event.preventDefault();
        wife.classList.add('is-revealed');
        wife.setAttribute('aria-expanded', 'true');
        return;
      }
      var aboutTab = document.querySelector('[data-panel="panel-me"]');
      if (aboutTab) activateTab(aboutTab, true, false);
      var works = document.getElementById('works');
      if (works) works.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
      wife.classList.remove('is-revealed');
      wife.setAttribute('aria-expanded', 'false');
      toast.textContent = lines[lineIdx % lines.length];
      lineIdx++;
      toast.classList.add('show');
      clearTimeout(timer);
      timer = setTimeout(function () { toast.classList.remove('show'); }, 2600);
    });
    document.addEventListener('pointerdown', function (event) {
      if (!wife.contains(event.target) && wife.classList.contains('is-revealed')) {
        wife.classList.remove('is-revealed');
        wife.setAttribute('aria-expanded', 'false');
      }
    }, { passive: true });
  }

  /* ---------- 项目截图轮播 + 无障碍放大层 ---------- */
  var lightbox = document.getElementById('lightbox');
  var lbContent = lightbox && lightbox.querySelector('.lb-content');
  var lbCount = lightbox && lightbox.querySelector('.lb-count');
  var lbStage = null;
  var lbIdx = 0;
  var lastFocus = null;

  function lbSlides() {
    return lbStage ? lbStage.querySelector('.slides').children : [];
  }
  function lbRender() {
    var slides = lbSlides();
    if (!slides.length || !lbContent || !lbCount) return;
    lbContent.innerHTML = '';
    lbContent.appendChild(slides[lbIdx].cloneNode(true));
    lbCount.textContent = (lbIdx + 1) + ' / ' + slides.length;
  }
  function lbOpen(stage, index) {
    if (!lightbox) return;
    lastFocus = document.activeElement;
    lbStage = stage;
    lbIdx = index;
    lbRender();
    lightbox.hidden = false;
    lightbox.classList.add('open');
    document.body.style.overflow = 'hidden';
    var close = lightbox.querySelector('.lb-x');
    if (close) close.focus();
  }
  function lbClose() {
    if (!lightbox) return;
    lightbox.classList.remove('open');
    lightbox.hidden = true;
    document.body.style.overflow = '';
    if (lbStage && lbStage._go) lbStage._go(lbIdx);
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }

  if (lightbox) {
    lightbox.addEventListener('click', function (event) { if (event.target === lightbox) lbClose(); });
    lightbox.querySelector('.lb-x').addEventListener('click', lbClose);
    lightbox.querySelector('.lb-prev').addEventListener('click', function () {
      lbIdx = (lbIdx - 1 + lbSlides().length) % lbSlides().length;
      lbRender();
    });
    lightbox.querySelector('.lb-next').addEventListener('click', function () {
      lbIdx = (lbIdx + 1) % lbSlides().length;
      lbRender();
    });
    document.addEventListener('keydown', function (event) {
      if (lightbox.hidden) return;
      if (event.key === 'Escape') lbClose();
      if (event.key === 'ArrowLeft') {
        lbIdx = (lbIdx - 1 + lbSlides().length) % lbSlides().length;
        lbRender();
      }
      if (event.key === 'ArrowRight') {
        lbIdx = (lbIdx + 1) % lbSlides().length;
        lbRender();
      }
      if (event.key === 'Tab') {
        var focusable = Array.prototype.slice.call(lightbox.querySelectorAll('button:not([disabled])'));
        if (!focusable.length) return;
        var first = focusable[0];
        var last = focusable[focusable.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    });
  }

  Array.prototype.forEach.call(document.querySelectorAll('.stage'), function (stage) {
    var slides = stage.querySelector('.slides');
    if (!slides || !slides.children.length) return;
    var count = slides.children.length;
    var index = 0;
    if (stage.querySelector('.slide img')) stage.classList.add('has-img');
    stage.tabIndex = 0;

    var dots = document.createElement('div');
    dots.className = 'stage-dots';
    for (var i = 0; i < count; i++) {
      (function (targetIndex) {
        var button = document.createElement('button');
        button.type = 'button';
        button.className = 'sdot';
        button.setAttribute('aria-label', '第' + (targetIndex + 1) + '张');
        button.addEventListener('click', function (event) {
          event.stopPropagation();
          go(targetIndex);
        });
        dots.appendChild(button);
      })(i);
    }
    stage.appendChild(dots);

    function update() {
      Array.prototype.forEach.call(dots.children, function (dot, dotIndex) {
        var current = dotIndex === index;
        dot.classList.toggle('on', current);
        dot.setAttribute('aria-pressed', current ? 'true' : 'false');
      });
    }
    function go(targetIndex) {
      index = (targetIndex + count) % count;
      slides.style.transform = index === 0 ? 'none' : 'translateX(-' + (index * 100) + '%)';
      update();
    }
    stage._go = go;

    var previous = stage.querySelector('.prev');
    var next = stage.querySelector('.next');
    if (previous) previous.addEventListener('click', function (event) { event.stopPropagation(); go(index - 1); });
    if (next) next.addEventListener('click', function (event) { event.stopPropagation(); go(index + 1); });
    stage.addEventListener('click', function () { lbOpen(stage, index); });
    stage.addEventListener('keydown', function (event) {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        lbOpen(stage, index);
      }
    });
    update();
  });

  var year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();
})();
