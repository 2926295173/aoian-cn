/* Aoian 导航页脚本 */
(() => {
  'use strict';

  /* ---------- 年份与备案 ---------- */
  const yearEl = document.querySelector('.year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------- 实时时钟 ---------- */
  const timeEl = document.getElementById('clock-time');
  const dateEl = document.getElementById('clock-date');
  const daysEl = document.getElementById('stat-days');
  const linksEl = document.getElementById('stat-links');

  const pad = (n) => String(n).padStart(2, '0');
  const weekMap = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];

  const SITE_START = new Date('2020-01-01T00:00:00');

  function tickClock() {
    const d = new Date();
    if (timeEl) timeEl.textContent = `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
    if (dateEl) dateEl.textContent = `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())} · ${weekMap[d.getDay()]}`;
    if (daysEl) {
      const days = Math.floor((d - SITE_START) / 86400000);
      daysEl.textContent = days > 0 ? days : 1;
    }
  }
  tickClock();
  setInterval(tickClock, 1000);

  if (linksEl) {
    linksEl.textContent = document.querySelectorAll('.grid .card:not(.card-placeholder)').length;
  }

  /* ---------- 每日诗词 ---------- */
  const poemEl = document.getElementById('poem');
  function loadPoem() {
    if (!poemEl) return;
    const SCRIPT_ID = 'jinrishici-script';
    if (document.getElementById(SCRIPT_ID)) return;
    const s = document.createElement('script');
    s.id = SCRIPT_ID;
    s.src = 'https://sdk.jinrishici.com/v2/browser/jinrishici.js';
    s.async = true;
    s.onload = () => {
      if (window.jinrishici && typeof window.jinrishici.load === 'function') {
        window.jinrishici.load((result) => {
          const data = result && result.data;
          if (data && data.content) {
            const origin = data.origin ? `「${data.origin}」` : '';
            poemEl.textContent = `『 ${data.content} ${origin} 』`;
          }
        });
      }
    };
    s.onerror = () => { poemEl.textContent = '『 诗词暂时无法加载 』'; };
    document.head.appendChild(s);
  }
  loadPoem();

  /* ---------- 主题切换 ---------- */
  const THEME_KEY = 'aoian-theme';
  const themeBtn = document.getElementById('theme-toggle');
  function applyTheme(t) {
    document.documentElement.setAttribute('data-theme', t);
  }
  const saved = localStorage.getItem(THEME_KEY);
  if (saved === 'light' || saved === 'dark') applyTheme(saved);
  else applyTheme(matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark');

  themeBtn?.addEventListener('click', () => {
    const cur = document.documentElement.getAttribute('data-theme') || 'dark';
    const next = cur === 'dark' ? 'light' : 'dark';
    applyTheme(next);
    localStorage.setItem(THEME_KEY, next);
  });

  /* ---------- 移动端菜单 ---------- */
  const menuBtn = document.getElementById('menu-toggle');
  const topnav = document.querySelector('.topnav');
  menuBtn?.addEventListener('click', () => topnav?.classList.toggle('open'));
  topnav?.querySelectorAll('a').forEach(a => a.addEventListener('click', () => topnav.classList.remove('open')));

  /* ---------- 搜索过滤 ---------- */
  const search = document.getElementById('search');
  const grid = document.getElementById('grid');
  const empty = document.getElementById('empty');
  const cards = grid ? Array.from(grid.querySelectorAll('.card')) : [];

  function filter(q) {
    const term = q.trim().toLowerCase();
    let shown = 0;
    cards.forEach(card => {
      const tags = (card.dataset.tags || '').toLowerCase();
      const text = card.textContent.toLowerCase();
      const hit = !term || tags.includes(term) || text.includes(term);
      card.style.display = hit ? '' : 'none';
      if (hit && !card.classList.contains('card-placeholder')) shown++;
    });
    if (empty) empty.hidden = shown > 0 || cards.filter(c => c.style.display !== 'none').length > 0;
    if (empty) {
      const visible = cards.filter(c => c.style.display !== 'none').length;
      empty.hidden = visible > 0;
    }
  }
  search?.addEventListener('input', e => filter(e.target.value));

  // 快捷键：/ 聚焦搜索
  document.addEventListener('keydown', (e) => {
    if (e.key === '/' && document.activeElement !== search && !e.metaKey && !e.ctrlKey) {
      e.preventDefault();
      search?.focus();
    }
    if (e.key === 'Escape' && document.activeElement === search) {
      search.value = '';
      filter('');
      search.blur();
    }
  });

  /* ---------- 卡片光标高光 ---------- */
  cards.forEach(card => {
    card.addEventListener('pointermove', (e) => {
      const r = card.getBoundingClientRect();
      card.style.setProperty('--mx', `${e.clientX - r.left}px`);
      card.style.setProperty('--my', `${e.clientY - r.top}px`);
    });
  });

  /* ---------- 返回顶部 ---------- */
  const back = document.getElementById('back-top');
  function onScroll() {
    if (!back) return;
    back.classList.toggle('show', window.scrollY > 400);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  back?.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

  /* ---------- 访问计数（本地占位） ---------- */
  const visitsEl = document.getElementById('visits');
  const VISITS_KEY = 'aoian-visits';
  try {
    const n = parseInt(localStorage.getItem(VISITS_KEY) || '0', 10) + 1;
    localStorage.setItem(VISITS_KEY, String(n));
    if (visitsEl) visitsEl.textContent = n;
  } catch (e) {
    if (visitsEl) visitsEl.textContent = '1';
  }

  /* ---------- 星空背景（Canvas） ---------- */
  const canvas = document.getElementById('bg-canvas');
  if (canvas) {
    const ctx = canvas.getContext('2d');
    let stars = [];
    let raf = null;
    let dpr = Math.min(window.devicePixelRatio || 1, 2);
    let w = 0, h = 0;
    let mouseX = -1000, mouseY = -1000;

    function resize() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = canvas.clientWidth = window.innerWidth;
      h = canvas.clientHeight = window.innerHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      initStars();
    }

    function initStars() {
      const count = Math.min(180, Math.floor((w * h) / 9000));
      stars = Array.from({ length: count }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        z: Math.random() * 0.8 + 0.2,
        r: Math.random() * 1.3 + 0.2,
        vx: (Math.random() - 0.5) * 0.05,
        vy: (Math.random() - 0.5) * 0.05,
        a: Math.random() * 0.6 + 0.2,
        tw: Math.random() * Math.PI * 2,
        ts: Math.random() * 0.02 + 0.005,
      }));
    }

    function step() {
      ctx.clearRect(0, 0, w, h);
      for (const s of stars) {
        s.x += s.vx * s.z;
        s.y += s.vy * s.z;
        s.tw += s.ts;
        if (s.x < -2) s.x = w + 2;
        if (s.x > w + 2) s.x = -2;
        if (s.y < -2) s.y = h + 2;
        if (s.y > h + 2) s.y = -2;

        // 鼠标排斥
        const dx = s.x - mouseX;
        const dy = s.y - mouseY;
        const dist = Math.hypot(dx, dy);
        if (dist < 120) {
          const f = (120 - dist) / 120;
          s.x += (dx / (dist || 1)) * f * 1.2;
          s.y += (dy / (dist || 1)) * f * 1.2;
        }

        const flicker = (Math.sin(s.tw) + 1) / 2;
        const alpha = s.a * (0.5 + flicker * 0.5);
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r * (0.8 + flicker * 0.4), 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${isLight() ? '40, 60, 100' : '220, 230, 255'}, ${alpha})`;
        ctx.fill();
      }
      raf = requestAnimationFrame(step);
    }

    function isLight() {
      return document.documentElement.getAttribute('data-theme') === 'light';
    }

    window.addEventListener('resize', resize);
    window.addEventListener('pointermove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    });

    // 暂停离屏动画节省资源
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        if (raf) cancelAnimationFrame(raf);
        raf = null;
      } else if (!raf) {
        raf = requestAnimationFrame(step);
      }
    });

    resize();
    raf = requestAnimationFrame(step);
  }

  /* ---------- 入场动画 ---------- */
  requestAnimationFrame(() => {
    document.querySelectorAll('.hero, .search-wrap, .sites, .about, .footer').forEach((el, i) => {
      el.style.animationDelay = `${i * 80}ms`;
      el.classList.add('fade-in');
    });
  });
})();