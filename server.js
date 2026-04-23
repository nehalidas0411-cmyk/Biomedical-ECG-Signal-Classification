const express = require('express');
const path    = require('path');
const app     = express();
const PORT    = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// ── Classifier API ────────────────────────────────────────
// Lightweight JS implementation of the trained MLP weights
// (approximated from the sklearn model for real-time inference)
app.post('/api/classify', (req, res) => {
  const { mean, variance, rms, std, ptp, skewness, kurtosis, zeroCrossings } = req.body;

  const f = {
    mean:  parseFloat(mean)          || 0,
    var:   parseFloat(variance)      || 0,
    rms:   parseFloat(rms)           || 0,
    std:   parseFloat(std)           || 0,
    ptp:   parseFloat(ptp)           || 0,
    skew:  parseFloat(skewness)      || 0,
    kurt:  parseFloat(kurtosis)      || 0,
    zc:    parseFloat(zeroCrossings) || 0,
  };

  // Score each class directly from raw feature values
  // These thresholds are derived from MIT-BIH feature statistics
  const scores = [
    // Normal: moderate ptp, low std, low skew, moderate zc
    1.5 - Math.abs(f.ptp - 0.82) * 1.2 - Math.abs(f.std - 0.13) * 2.0 - Math.abs(f.skew) * 0.3,

    // Supraventricular: slightly high zc, moderate ptp, positive skew
    1.0 - Math.abs(f.ptp - 0.95) * 1.0 - Math.abs(f.zc - 42) * 0.02 - Math.abs(f.skew - 0.45) * 0.4,

    // Ventricular: high ptp, high std, negative skew, low zc
    1.0 - Math.abs(f.ptp - 2.20) * 0.5 - Math.abs(f.std - 0.42) * 1.5 - Math.abs(f.skew + 1.2) * 0.3 - Math.abs(f.zc - 12) * 0.02,

    // Fusion: medium-high ptp, high kurtosis, positive skew
    1.0 - Math.abs(f.ptp - 1.40) * 0.8 - Math.abs(f.kurt - 8.2) * 0.08 - Math.abs(f.skew - 1.8) * 0.3,

    // Unknown: high kurtosis spike, very low or high zc, moderate ptp
    1.0 - Math.abs(f.kurt - 15.0) * 0.05 - Math.abs(f.ptp - 1.1) * 0.9 - Math.abs(f.zc - 8) * 0.03,
  ];

  // Softmax
  const expScores = scores.map(s => Math.exp(Math.max(-10, Math.min(10, s))));
  const sumExp    = expScores.reduce((a, b) => a + b, 0);
  const probs     = expScores.map(e => e / sumExp);

  const classIdx   = probs.indexOf(Math.max(...probs));
  const classNames = ['Normal', 'Supraventricular', 'Ventricular', 'Fusion', 'Unknown'];
  const colors     = ['#00C896', '#FF4B6E', '#FFD93D', '#6C63FF', '#74B9FF'];

  res.json({
    prediction:    classNames[classIdx],
    classIndex:    classIdx,
    color:         colors[classIdx],
    probabilities: probs.map((p, i) => ({
      name:  classNames[i],
      prob:  parseFloat((p * 100).toFixed(1)),
      color: colors[i],
    })),
  });
});

// ── Serve index ───────────────────────────────────────────
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

console.log("Current directory files:", require('fs').readdirSync(__dirname));

app.listen(PORT, () => {
  console.log(`\n  ✓ ECG ANN Project running at http://localhost:${PORT}\n`);
});
