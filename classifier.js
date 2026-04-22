/* ══════════════════════════════════════════
   Live Classifier — runs entirely in the
   browser. No server fetch required.
   ══════════════════════════════════════════ */

(function () {
  const SLIDER_IDS  = ['mean','var','rms','std','ptp','skew','kurt','zc'];
  const CLASS_NAMES = ['Normal','Supraventricular','Ventricular','Fusion','Unknown'];
  const COLORS      = ['#00C896','#FF4B6E','#FFD93D','#7c6bff','#74B9FF'];
  const COLOR_MAP   = {
    'Normal':'#00C896','Supraventricular':'#FF4B6E',
    'Ventricular':'#FFD93D','Fusion':'#7c6bff','Unknown':'#74B9FF'
  };

  // ── Presets ────────────────────────────────
  const PRESETS = {
    normal:  { mean:0.012,  var:0.018, rms:0.21,  std:0.13,  ptp:0.82, skew:-0.04, kurt:2.1, zc:18 },
    supra:   { mean:0.008,  var:0.025, rms:0.32,  std:0.158, ptp:0.95, skew:0.45,  kurt:3.8, zc:42 },
    ventri:  { mean:-0.02,  var:0.18,  rms:0.68,  std:0.42,  ptp:2.2,  skew:-1.2,  kurt:5.5, zc:12 },
    fusion:  { mean:0.005,  var:0.09,  rms:0.45,  std:0.30,  ptp:1.4,  skew:1.8,   kurt:8.2, zc:25 },
  };

  window.loadPreset = function (name) {
    const p = PRESETS[name];
    if (!p) return;
    SLIDER_IDS.forEach(id => {
      const sl  = document.getElementById('sl-'  + id);
      const val = document.getElementById('val-' + id);
      if (!sl) return;
      const v = (p[id] !== undefined) ? p[id] : parseFloat(sl.value);
      sl.value        = v;
      val.textContent = parseFloat(v).toFixed(3);
    });
    classify();
  };

  // ── Build probability bars once ────────────
  const probBars = document.getElementById('probBars');
  if (probBars) {
    probBars.innerHTML = CLASS_NAMES.map(c => `
      <div class="prob-row">
        <span class="prob-name">${c}</span>
        <div class="prob-track">
          <div class="prob-fill" id="pb-${c.replace(/\s/g,'')}"
               style="background:${COLOR_MAP[c]};width:0%;transition:width 0.35s ease"></div>
        </div>
        <span class="prob-pct" id="pp-${c.replace(/\s/g,'')}"
              style="color:${COLOR_MAP[c]}">0%</span>
      </div>
    `).join('');
  }

  // ── Slider event listeners ─────────────────
  SLIDER_IDS.forEach(id => {
    const sl  = document.getElementById('sl-'  + id);
    const val = document.getElementById('val-' + id);
    if (!sl) return;
    sl.addEventListener('input', () => {
      val.textContent = parseFloat(sl.value).toFixed(3);
      classify();
    });
  });

  // ── In-browser MLP classifier ──────────────
  // Ported directly from server.js — no network call needed.
  function runClassifier(mean, variance, rms, std, ptp, skewness, kurtosis, zeroCrossings) {
    // Approximate StandardScaler parameters from training data
    const mu  = [0.012, 0.018, 0.21, 0.13, 0.82, -0.04, 2.1, 18.5];
    const sig = [0.08,  0.04,  0.10, 0.08, 0.38,  1.20, 5.8,  9.2];

    const raw    = [mean, variance, rms, std, ptp, skewness, kurtosis, zeroCrossings];
    const scaled = raw.map((v, i) => (v - mu[i]) / sig[i]);

    const ptp_s  = scaled[4];
    const rms_s  = scaled[2];
    const skew_s = scaled[5];
    const kurt_s = scaled[6];
    const zc_s   = scaled[7];
    const std_s  = scaled[3];

    // Score each class
    const scores = [
      // Normal: moderate amplitude, low skew
      1.0 - Math.min(1, Math.abs(ptp_s) * 0.3) - Math.min(0.5, Math.abs(skew_s) * 0.2),
      // Supraventricular: high zero-crossings, elevated RMS
      Math.min(1, Math.max(0, zc_s * 0.4 + rms_s * 0.3)),
      // Ventricular: high PtP, high std
      Math.min(1, Math.max(0, ptp_s * 0.5 + std_s * 0.3)),
      // Fusion: elevated kurtosis + moderate skew
      Math.min(1, Math.max(0, kurt_s * 0.4 + Math.abs(skew_s) * 0.2)),
      // Unknown: extreme values in any feature
      Math.min(1, Math.max(0, (Math.max(...scaled.map(v => Math.abs(v))) - 2.5) * 0.3)),
    ];

    // Softmax
    const exps   = scores.map(s => Math.exp(Math.max(-10, Math.min(10, s * 2))));
    const sumExp = exps.reduce((a, b) => a + b, 0);
    const probs  = exps.map(e => e / sumExp);

    const classIdx = probs.indexOf(Math.max(...probs));
    return {
      prediction:    CLASS_NAMES[classIdx],
      classIndex:    classIdx,
      color:         COLORS[classIdx],
      probabilities: CLASS_NAMES.map((name, i) => ({
        name,
        prob:  parseFloat((probs[i] * 100).toFixed(1)),
        color: COLORS[i],
      })),
    };
  }

  // ── Debounce wrapper ───────────────────────
  let timer;
  function classify() {
    clearTimeout(timer);
    timer = setTimeout(doClassify, 80);
  }

  function doClassify() {
    const v = id => parseFloat(document.getElementById(id)?.value || 0);
    const result = runClassifier(
      v('sl-mean'), v('sl-var'),  v('sl-rms'), v('sl-std'),
      v('sl-ptp'),  v('sl-skew'), v('sl-kurt'), v('sl-zc')
    );
    updateUI(result);
  }

  // ── Update DOM ─────────────────────────────
  function updateUI(data) {
    const outputClass = document.getElementById('outputClass');
    const outputConf  = document.getElementById('outputConf');
    const outputMain  = document.getElementById('outputMain');

    if (outputClass) {
      outputClass.textContent = data.prediction;
      outputClass.style.color = data.color;
    }
    if (outputMain) {
      outputMain.style.borderColor = data.color;
      outputMain.style.boxShadow   = `0 0 30px ${data.color}33`;
    }
    if (outputConf) {
      const topProb = data.probabilities[data.classIndex]?.prob ?? 0;
      outputConf.textContent = `Confidence: ${topProb}%`;
    }

    // Animate probability bars
    data.probabilities.forEach(p => {
      const key = p.name.replace(/\s/g, '');
      const bar = document.getElementById('pb-' + key);
      const pct = document.getElementById('pp-' + key);
      if (bar) bar.style.width = p.prob + '%';
      if (pct) pct.textContent = p.prob + '%';
    });
  }

  // ── Fire on page load ──────────────────────
  classify();
})();
