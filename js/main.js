(function () {
  'use strict';

  var fine = window.matchMedia('(pointer: fine)').matches;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- 阅读进度 ---------- */
  var bar = document.getElementById('bar');
  var pval = document.getElementById('progress-value');
  function onScroll() {
    var h = document.documentElement;
    var max = h.scrollHeight - h.clientHeight;
    var p = max > 0 ? h.scrollTop / max : 0;
    if (bar) bar.style.transform = 'scaleX(' + p.toFixed(4) + ')';
    if (pval) pval.textContent = String(Math.round(p * 100)).padStart(2, '0');
  }
  document.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- tab 面板切换 ---------- */
  var tabs = Array.prototype.slice.call(document.querySelectorAll('.tab'));
  function activateTab(t) {
    tabs.forEach(function (o) {
      o.classList.remove('active');
      o.setAttribute('aria-selected', 'false');
    });
    t.classList.add('active');
    t.setAttribute('aria-selected', 'true');
    Array.prototype.forEach.call(document.querySelectorAll('.panel'), function (p) {
      p.classList.remove('active');
      p.hidden = true;
    });
    var panel = document.getElementById(t.getAttribute('data-panel'));
    if (panel) {
      panel.hidden = false;
      void panel.offsetWidth; /* 重启入场动画 */
      panel.classList.add('active');
    }
  }
  tabs.forEach(function (t) { t.addEventListener('click', function () { activateTab(t); }); });

  /* ---------- 滚动显现 ---------- */
  var reveals = Array.prototype.slice.call(document.querySelectorAll('.reveal'));
  // 首屏内容无需等待 IntersectionObserver；这也让较慢的浏览器首帧保持可见。
  var firstHero = document.querySelector('.hero.reveal');
  if (firstHero) firstHero.classList.add('in');
  if (reduce || !('IntersectionObserver' in window)) {
    reveals.forEach(function (el) { el.classList.add('in'); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          en.target.classList.add('in');
          io.unobserve(en.target);
        }
      });
    }, { threshold: 0.12 });
    reveals.forEach(function (el) { io.observe(el); });
  }

  /* ---------- 自定义光标（首屏形象保持完全静态） ---------- */
  var cursor = document.getElementById('cursor');
  var rawX = window.innerWidth / 2, rawY = window.innerHeight / 2;
  var curX = rawX, curY = rawY;

  window.addEventListener('pointermove', function (e) {
    rawX = e.clientX;
    rawY = e.clientY;
    if (fine && !reduce) document.body.classList.add('cursor-on');
  }, { passive: true });
  document.addEventListener('mouseover', function (e) {
    if (!cursor) return;
    var hot = e.target.closest && e.target.closest('a, button, .chip, .wife');
    cursor.classList.toggle('is-hover', !!hot);
  });

  function loop() {
    if (cursor && fine && !reduce) {
      curX += (rawX - curX) * 0.18;
      curY += (rawY - curY) * 0.18;
      cursor.style.transform = 'translate(' + curX + 'px,' + curY + 'px) translate(-50%,-50%)';
    }
    requestAnimationFrame(loop);
  }
  if (fine && !reduce) requestAnimationFrame(loop);

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
    wife.addEventListener('click', function () {
      var aboutTab = document.querySelector('[data-panel="panel-me"]');
      if (aboutTab) activateTab(aboutTab);
      var works = document.getElementById('works');
      if (works) works.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
      toast.textContent = lines[lineIdx % lines.length];
      lineIdx++;
      toast.classList.add('show');
      clearTimeout(timer);
      timer = setTimeout(function () { toast.classList.remove('show'); }, 2600);
    });
  }

  /* ---------- 项目截图轮播 + 点击放大 ---------- */
  var lightbox = document.getElementById('lightbox');
  var lbContent = lightbox.querySelector('.lb-content');
  var lbCount = lightbox.querySelector('.lb-count');
  var lbStage = null, lbIdx = 0;

  function lbSlides() { return lbStage.querySelector('.slides').children; }
  function lbRender() {
    var slides = lbSlides();
    lbContent.innerHTML = '';
    lbContent.appendChild(slides[lbIdx].cloneNode(true));
    lbCount.textContent = (lbIdx + 1) + ' / ' + slides.length;
  }
  function lbOpen(stage, i) {
    lbStage = stage; lbIdx = i; lbRender();
    lightbox.classList.add('open');
    document.body.style.overflow = 'hidden';
  }
  function lbClose() {
    lightbox.classList.remove('open');
    document.body.style.overflow = '';
    if (lbStage && lbStage._go) lbStage._go(lbIdx);
  }
  lightbox.addEventListener('click', function (e) { if (e.target === lightbox) lbClose(); });
  lightbox.querySelector('.lb-x').addEventListener('click', lbClose);
  lightbox.querySelector('.lb-prev').addEventListener('click', function () {
    lbIdx = (lbIdx - 1 + lbSlides().length) % lbSlides().length; lbRender();
  });
  lightbox.querySelector('.lb-next').addEventListener('click', function () {
    lbIdx = (lbIdx + 1) % lbSlides().length; lbRender();
  });
  document.addEventListener('keydown', function (e) {
    if (!lightbox.classList.contains('open')) return;
    if (e.key === 'Escape') lbClose();
    if (e.key === 'ArrowLeft') { lbIdx = (lbIdx - 1 + lbSlides().length) % lbSlides().length; lbRender(); }
    if (e.key === 'ArrowRight') { lbIdx = (lbIdx + 1) % lbSlides().length; lbRender(); }
  });

  Array.prototype.forEach.call(document.querySelectorAll('.stage'), function (stage) {
    var slides = stage.querySelector('.slides');
    var n = slides.children.length, idx = 0;

    var dots = document.createElement('div');
    dots.className = 'stage-dots';
    for (var i = 0; i < n; i++) {
      (function (k) {
        var b = document.createElement('button');
        b.className = 'sdot';
        b.setAttribute('aria-label', '第' + (k + 1) + '张');
        b.addEventListener('click', function (e) { e.stopPropagation(); go(k); });
        dots.appendChild(b);
      })(i);
    }
    stage.appendChild(dots);

    function update() {
      Array.prototype.forEach.call(dots.children, function (d, i) {
        d.classList.toggle('on', i === idx);
      });
    }
    function go(k) {
      idx = (k + n) % n;
      slides.style.transform = 'translateX(-' + (idx * 100) + '%)';
      update();
    }
    stage._go = go;

    stage.querySelector('.prev').addEventListener('click', function (e) { e.stopPropagation(); go(idx - 1); });
    stage.querySelector('.next').addEventListener('click', function (e) { e.stopPropagation(); go(idx + 1); });
    stage.addEventListener('click', function () { lbOpen(stage, idx); });
    update();
  });

  /* ---------- 页脚年份 ---------- */
  var year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();
})();
