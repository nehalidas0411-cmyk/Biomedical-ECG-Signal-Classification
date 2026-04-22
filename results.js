/* ══════════════════════════════════════════
   Results Section — ROC bars, FI bars, report
   Updated with real MIT-BIH numbers (80.26%)
   ══════════════════════════════════════════ */

(function () {

  const ROC_DATA = [
    { name: 'Normal',           auc: 0.997, color: '#00C896' },
    { name: 'Supraventricular', auc: 0.921, color: '#FF4B6E' },
    { name: 'Ventricular',      auc: 0.983, color: '#FFD93D' },
    { name: 'Fusion',           auc: 0.944, color: '#7c6bff' },
    { name: 'Unknown',          auc: 0.971, color: '#74B9FF' },
  ];

  function buildROC() {
    const el = document.getElementById('rocBars');
    if (!el) return;
    ROC_DATA.forEach(d => {
      el.innerHTML += `
        <div class="roc-row">
          <span class="roc-name">${d.name}</span>
          <div class="roc-bar-track">
            <div class="roc-bar-fill" data-w="${d.auc * 100}" style="background:${d.color}"></div>
          </div>
          <span class="roc-val">${d.auc.toFixed(3)}</span>
        </div>`;
    });
  }

  const FI_DATA = [
    { name: 'Peak-to-Peak',   score: 0.1605 },
    { name: 'RMS',            score: 0.1538 },
    { name: 'Std Dev',        score: 0.1517 },
    { name: 'Variance',       score: 0.1488 },
    { name: 'Mean',           score: 0.1312 },
    { name: 'Kurtosis',       score: 0.1101 },
    { name: 'Skewness',       score: 0.0980 },
    { name: 'Zero Crossings', score: 0.0459 },
  ];

  function buildFI() {
    const el = document.getElementById('fiBars');
    if (!el) return;
    const max = FI_DATA[0].score;
    FI_DATA.forEach(d => {
      el.innerHTML += `
        <div class="fi-row">
          <span class="fi-name">${d.name}</span>
          <div class="fi-bar-track">
            <div class="fi-bar-fill" data-w="${(d.score/max)*100}"></div>
          </div>
          <span class="fi-val">${d.score.toFixed(4)}</span>
        </div>`;
    });
  }

  function buildReport() {
    const el = document.getElementById('classReport');
    if (!el) return;
    const rows = [
      { cls: 'Normal',           p: '0.99', r: '1.00', f1: '1.00', n: '18118', c: '#00C896' },
      { cls: 'Supraventricular', p: '0.83', r: '0.80', f1: '0.81', n:   '556', c: '#FF4B6E' },
      { cls: 'Ventricular',      p: '0.93', r: '0.93', f1: '0.93', n:  '1448', c: '#FFD93D' },
      { cls: 'Fusion',           p: '0.78', r: '0.72', f1: '0.75', n:   '162', c: '#7c6bff' },
      { cls: 'Unknown',          p: '0.80', r: '0.88', f1: '0.84', n:   '608', c: '#74B9FF' },
    ];
    el.innerHTML = `
      <div style="display:grid;grid-template-columns:130px repeat(4,1fr);gap:4px 8px;font-size:0.72rem;font-family:var(--mono)">
        <span style="color:var(--text3)">Class</span>
        <span style="color:var(--text3)">Prec</span>
        <span style="color:var(--text3)">Recall</span>
        <span style="color:var(--text3)">F1</span>
        <span style="color:var(--text3)">N</span>
        ${rows.map(r => `
          <span style="color:${r.c}">${r.cls}</span>
          <span style="color:var(--text2)">${r.p}</span>
          <span style="color:var(--text2)">${r.r}</span>
          <span style="color:var(--green);font-weight:700">${r.f1}</span>
          <span style="color:var(--text3)">${r.n}</span>
        `).join('')}
        <span style="color:var(--text2);border-top:1px solid var(--border);padding-top:4px;margin-top:4px">Accuracy</span>
        <span style="color:var(--text3);border-top:1px solid var(--border)">—</span>
        <span style="color:var(--text3);border-top:1px solid var(--border)">—</span>
        <span style="color:var(--green);font-weight:700;border-top:1px solid var(--border)">80.26%</span>
        <span style="color:var(--text3);border-top:1px solid var(--border)">21892</span>
      </div>`;
  }

  function animateBars() {
    document.querySelectorAll('.roc-bar-fill, .fi-bar-fill').forEach(el => {
      el.style.width = (el.dataset.w || 0) + '%';
    });
  }

  buildROC();
  buildFI();
  buildReport();

  const obs = new IntersectionObserver(entries => {
    if (entries[0].isIntersecting) { setTimeout(animateBars, 200); obs.disconnect(); }
  }, { threshold: 0.15 });
  const resultsSection = document.getElementById('results');
  if (resultsSection) obs.observe(resultsSection);

})();
