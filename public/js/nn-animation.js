/* ══════════════════════════════════════════════════
   Neural Network Animation — Canvas-based
   Animates signal flow through 8→64→32→16→5 MLP
   ══════════════════════════════════════════════════ */

(function () {
  const canvas  = document.getElementById('nn-canvas');
  const ctx     = canvas.getContext('2d');

  // Layer config: [count, colour, label]
  const LAYERS = [
    { n: 8,  color: '#00f5a0', label: 'Input\n(8)',    displayed: 8  },
    { n: 64, color: '#00d4ff', label: 'Hidden 1\n(64)',displayed: 8  },
    { n: 32, color: '#7c6bff', label: 'Hidden 2\n(32)',displayed: 8  },
    { n: 16, color: '#ff6b9d', label: 'Hidden 3\n(16)',displayed: 8  },
    { n: 5,  color: '#ffd93d', label: 'Output\n(5)',   displayed: 5  },
  ];

  const OUTPUT_LABELS = ['Normal','Supra','Ventri','Fusion','Unknown'];

  let W, H;
  let nodes  = [];   // [{x,y,layer,idx}]
  let pulses = [];   // [{x,y,tx,ty,progress,color,alpha}]
  let frame  = 0;

  function resize() {
    const rect = canvas.getBoundingClientRect();
    W = canvas.width  = rect.width  * devicePixelRatio;
    H = canvas.height = rect.height * devicePixelRatio;
    canvas.style.width  = rect.width  + 'px';
    canvas.style.height = rect.height + 'px';
    buildNodes();
  }

  function buildNodes() {
    nodes = [];
    const padX = W * 0.06;
    const padY = H * 0.12;
    const layerSpacing = (W - padX * 2) / (LAYERS.length - 1);

    LAYERS.forEach((layer, li) => {
      const x   = padX + li * layerSpacing;
      const cnt = layer.displayed;
      const nodeSpacing = (H - padY * 2) / (cnt - 1 || 1);
      for (let ni = 0; ni < cnt; ni++) {
        const y = cnt === 1 ? H / 2 : padY + ni * nodeSpacing;
        nodes.push({ x, y, layer: li, idx: ni, layer_ref: layer });
      }
    });
  }

  function drawConnections() {
    // Draw faint connection lines between adjacent layers
    for (let li = 0; li < LAYERS.length - 1; li++) {
      const fromNodes = nodes.filter(n => n.layer === li);
      const toNodes   = nodes.filter(n => n.layer === li + 1);
      const col = LAYERS[li].color;

      fromNodes.forEach(fn => {
        toNodes.forEach(tn => {
          ctx.beginPath();
          ctx.moveTo(fn.x, fn.y);
          ctx.lineTo(tn.x, tn.y);
          ctx.strokeStyle = hexToRgba(col, 0.04);
          ctx.lineWidth   = 0.5 * devicePixelRatio;
          ctx.stroke();
        });
      });
    }
  }

  function drawNodes() {
    nodes.forEach(n => {
      const r = (n.layer_ref.displayed <= 5 ? 12 : 7) * devicePixelRatio;

      // Glow
      const grad = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, r * 3);
      grad.addColorStop(0, hexToRgba(n.layer_ref.color, 0.25));
      grad.addColorStop(1, hexToRgba(n.layer_ref.color, 0));
      ctx.beginPath();
      ctx.arc(n.x, n.y, r * 3, 0, Math.PI * 2);
      ctx.fillStyle = grad;
      ctx.fill();

      // Node circle
      ctx.beginPath();
      ctx.arc(n.x, n.y, r, 0, Math.PI * 2);
      ctx.fillStyle = hexToRgba(n.layer_ref.color, 0.15);
      ctx.fill();
      ctx.strokeStyle = n.layer_ref.color;
      ctx.lineWidth   = 1.5 * devicePixelRatio;
      ctx.stroke();

      // Output labels
      if (n.layer === LAYERS.length - 1) {
        ctx.fillStyle  = '#e8f4ff';
        ctx.font       = `${10 * devicePixelRatio}px 'Outfit', sans-serif`;
        ctx.textAlign  = 'left';
        ctx.fillText(OUTPUT_LABELS[n.idx], n.x + r + 6 * devicePixelRatio, n.y + 4 * devicePixelRatio);
      }
    });
  }

  function drawLabels() {
    ctx.textAlign = 'center';
    LAYERS.forEach((layer, li) => {
      const lnodes = nodes.filter(n => n.layer === li);
      if (!lnodes.length) return;
      const x = lnodes[0].x;
      const lines = layer.label.split('\n');
      lines.forEach((line, i) => {
        ctx.fillStyle = hexToRgba(layer.color, 0.7);
        ctx.font = `${9 * devicePixelRatio}px 'Space Mono', monospace`;
        ctx.fillText(line, x, 28 * devicePixelRatio + i * 14 * devicePixelRatio);
      });
    });
  }

  function drawPulses() {
    pulses = pulses.filter(p => p.progress < 1);
    pulses.forEach(p => {
      p.progress += 0.018;
      const t  = ease(p.progress);
      const px = p.sx + (p.tx - p.sx) * t;
      const py = p.sy + (p.ty - p.sy) * t;

      const r    = 4 * devicePixelRatio;
      const grad = ctx.createRadialGradient(px, py, 0, px, py, r * 3);
      grad.addColorStop(0, hexToRgba(p.color, 0.9));
      grad.addColorStop(1, hexToRgba(p.color, 0));

      ctx.beginPath();
      ctx.arc(px, py, r * 3, 0, Math.PI * 2);
      ctx.fillStyle = grad;
      ctx.fill();

      ctx.beginPath();
      ctx.arc(px, py, r, 0, Math.PI * 2);
      ctx.fillStyle = p.color;
      ctx.fill();
    });
  }

  function spawnPulse() {
    // Pick random source node in layer 0..3
    const srcLayer = Math.floor(Math.random() * (LAYERS.length - 1));
    const dstLayer = srcLayer + 1;
    const srcNodes = nodes.filter(n => n.layer === srcLayer);
    const dstNodes = nodes.filter(n => n.layer === dstLayer);
    if (!srcNodes.length || !dstNodes.length) return;

    const src = srcNodes[Math.floor(Math.random() * srcNodes.length)];
    const dst = dstNodes[Math.floor(Math.random() * dstNodes.length)];

    pulses.push({
      sx: src.x, sy: src.y,
      tx: dst.x, ty: dst.y,
      progress: 0,
      color: LAYERS[srcLayer].color
    });
  }

  function ease(t) { return t < 0.5 ? 2*t*t : -1+(4-2*t)*t; }

  function hexToRgba(hex, alpha) {
    const r = parseInt(hex.slice(1,3),16);
    const g = parseInt(hex.slice(3,5),16);
    const b = parseInt(hex.slice(5,7),16);
    return `rgba(${r},${g},${b},${alpha})`;
  }

  function tick() {
    ctx.clearRect(0, 0, W, H);
    frame++;

    if (frame % 3 === 0) spawnPulse();

    drawConnections();
    drawPulses();
    drawNodes();
    drawLabels();

    requestAnimationFrame(tick);
  }

  // Init
  window.addEventListener('resize', resize);
  resize();
  tick();
})();
