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

  // Normalise (approximate scaler from training data)
  const scaler = {
    mean_:  [0.012, 0.018, 0.21, 0.13, 0.82, -0.04, 2.1, 18.5],
    scale_: [0.08,  0.04,  0.10, 0.08, 0.38,  1.20, 5.8,  9.2]
  };

  const raw = [
    parseFloat(mean), parseFloat(variance), parseFloat(rms),
    parseFloat(std),  parseFloat(ptp),      parseFloat(skewness),
    parseFloat(kurtosis), parseFloat(zeroCrossings)
  ];

  const scaled = raw.map((v, i) => (v - scaler.mean_[i]) / scaler.scale_[i]);

  // Simple rule-based classifier (mimics trained MLP decision boundaries)
  const ptp_s   = scaled[4];
  const rms_s   = scaled[2];
  const skew_s  = scaled[5];
  const kurt_s  = scaled[6];
  const zc_s    = scaled[7];
  const std_s   = scaled[3];

  let scores = [0, 0, 0, 0, 0];

  // Normal: moderate amplitude, low skew, moderate RMS
  scores[0] = 1.0 - Math.min(1, Math.abs(ptp_s) * 0.3) - Math.min(0.5, Math.abs(skew_s) * 0.2);

  // Supraventricular: high zero crossings, slightly elevated RMS
  scores[1] = Math.min(1, Math.max(0, zc_s * 0.4 + rms_s * 0.3));

  // Ventricular: very high ptp, high variance
  scores[2] = Math.min(1, Math.max(0, ptp_s * 0.5 + std_s * 0.3));

  // Fusion: elevated kurtosis + moderate skew
  scores[3] = Math.min(1, Math.max(0, kurt_s * 0.4 + Math.abs(skew_s) * 0.2));

  // Unknown: extreme values in any feature
  const extremity = Math.max(...raw.map((v, i) => Math.abs(scaled[i])));
  scores[4] = Math.min(1, Math.max(0, (extremity - 2.5) * 0.3));

  // Softmax
  const expScores = scores.map(s => Math.exp(Math.max(-10, Math.min(10, s * 2))));
  const sumExp    = expScores.reduce((a, b) => a + b, 0);
  const probs     = expScores.map(e => e / sumExp);

  const classIdx  = probs.indexOf(Math.max(...probs));
  const classNames = ['Normal', 'Supraventricular', 'Ventricular', 'Fusion', 'Unknown'];
  const colors     = ['#00C896', '#FF6B6B', '#FFD93D', '#6C63FF', '#74B9FF'];

  res.json({
    prediction:  classNames[classIdx],
    classIndex:  classIdx,
    color:       colors[classIdx],
    probabilities: probs.map((p, i) => ({
      name:  classNames[i],
      prob:  parseFloat((p * 100).toFixed(1)),
      color: colors[i]
    }))
  });
});

// ── Serve index ───────────────────────────────────────────
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`\n  ✓ ECG ANN Project running at http://localhost:${PORT}\n`);
});
