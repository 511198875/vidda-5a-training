/* ===========================================================
   数字营销新人课 · 网页课件 交互脚本
   ← → 翻页 / O 目录 / F 全屏 / Home End 首末页
   =========================================================== */
(function () {
  const slides = Array.from(document.querySelectorAll('.slide'));
  const stage = document.getElementById('stage');
  const progress = document.getElementById('progress');
  const hudMod = document.getElementById('hudMod');
  const hudPage = document.getElementById('hudPage');
  const overview = document.getElementById('overview');
  const ovGrid = document.getElementById('ovGrid');
  let cur = 0;

  const pad = n => String(n).padStart(2, '0');

  /* ---------- 渲染 ---------- */
  function render(i, { silent } = {}) {
    cur = Math.max(0, Math.min(slides.length - 1, i));
    slides.forEach((s, k) => s.classList.toggle('active', k === cur));

    const s = slides[cur];
    progress.style.width = ((cur + 1) / slides.length * 100) + '%';
    hudMod.textContent = s.dataset.modname || '';
    hudPage.textContent = (cur + 1) + ' / ' + slides.length;

    // 当前模块主色 → 进度条 / 控件 / HUD 圆点
    const a = getComputedStyle(s).getPropertyValue('--a').trim() || '#7F77DD';
    document.documentElement.style.setProperty('--a', a);
    document.documentElement.style.setProperty(
      '--a-soft',
      getComputedStyle(s).getPropertyValue('--a-soft').trim() || '#F1EFFC'
    );

    if (!silent) {
      const id = 'p' + pad(cur + 1);
      if (location.hash.slice(1) !== id) history.replaceState(null, '', '#' + id);
    }
    highlightOverview();
  }

  const next = () => render(cur + 1);
  const prev = () => render(cur - 1);

  /* ---------- 目录总览 ---------- */
  slides.forEach((s, i) => {
    const b = document.createElement('button');
    b.className = 'ov-item';
    b.style.setProperty('--mv', getComputedStyle(s).getPropertyValue('--a').trim());
    b.innerHTML =
      '<span class="ov-n">' + pad(i + 1) + '</span>' +
      '<span class="ov-t">' + (s.dataset.title || s.dataset.modname || '') + '</span>';
    b.addEventListener('click', () => { toggleOverview(false); render(i); });
    ovGrid.appendChild(b);
  });

  function toggleOverview(force) {
    const on = force === undefined ? !overview.classList.contains('on') : force;
    overview.classList.toggle('on', on);
  }
  function highlightOverview() {
    Array.from(ovGrid.children).forEach((el, i) => el.classList.toggle('cur', i === cur));
  }

  /* ---------- 键盘 ---------- */
  document.addEventListener('keydown', e => {
    const k = e.key;
    if (k === 'ArrowRight' || k === 'ArrowDown' || k === 'PageDown' || k === ' ') { e.preventDefault(); next(); }
    else if (k === 'ArrowLeft' || k === 'ArrowUp' || k === 'PageUp') { e.preventDefault(); prev(); }
    else if (k === 'Home') { e.preventDefault(); render(0); }
    else if (k === 'End') { e.preventDefault(); render(slides.length - 1); }
    else if (k === 'o' || k === 'O') { e.preventDefault(); toggleOverview(); }
    else if (k === 'Escape') { toggleOverview(false); }
    else if (k === 'f' || k === 'F') { toggleFullscreen(); }
    else if (k === 'p' || k === 'P') { window.print(); }
  });

  function toggleFullscreen() {
    if (!document.fullscreenElement) stage.requestFullscreen && stage.requestFullscreen();
    else document.exitFullscreen && document.exitFullscreen();
  }

  /* ---------- 按钮 & 点击区 ---------- */
  document.getElementById('btnNext').addEventListener('click', next);
  document.getElementById('btnPrev').addEventListener('click', prev);
  document.getElementById('btnOv').addEventListener('click', () => toggleOverview());
  overview.addEventListener('click', e => { if (e.target === overview) toggleOverview(false); });

  // 点击舞台左右 22% 区域翻页（避开中间内容区，防止误触）
  stage.addEventListener('click', e => {
    if (e.target.closest('button, a, #overview, #hud')) return;
    const r = stage.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width;
    if (x > 0.82) next();
    else if (x < 0.12) prev();
  });

  /* ---------- 触屏滑动 ---------- */
  let tx = 0, ty = 0;
  stage.addEventListener('touchstart', e => { tx = e.touches[0].clientX; ty = e.touches[0].clientY; }, { passive: true });
  stage.addEventListener('touchend', e => {
    const dx = e.changedTouches[0].clientX - tx;
    const dy = e.changedTouches[0].clientY - ty;
    if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy)) { dx < 0 ? next() : prev(); }
  }, { passive: true });

  /* ---------- 初始化 ---------- */
  const m = (location.hash.match(/^#p(\d+)$/) || [])[1];
  render(m ? parseInt(m, 10) - 1 : 0, { silent: true });
  window.addEventListener('hashchange', () => {
    const h = (location.hash.match(/^#p(\d+)$/) || [])[1];
    if (h) render(parseInt(h, 10) - 1, { silent: true });
  });
})();
