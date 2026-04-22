# ECG ANN Classifier — SRM Institute
### Artificial Neural Networks & Pattern Recognition

**Team:** Rohini C · Ram Karthikeyan · Nehali Das · Dharshan S  
**Guide:** Dr. Varshini Karthik  
**Institute:** SRM Institute of Science and Technology

---

## 🚀 Quick Start (Local)

```bash
# 1. Install dependencies
npm install

# 2. Run the server
npm start

# 3. Open in browser
# http://localhost:3000
```

---

## 📁 Project Structure

```
ecg-ann-classifier/
├── server.js              ← Express backend + /api/classify endpoint
├── package.json
├── .gitignore
├── public/
│   ├── index.html         ← Full single-page website
│   ├── css/
│   │   └── style.css      ← Complete stylesheet
│   └── js/
│       ├── nn-animation.js  ← Canvas neural network animation
│       ├── results.js       ← Confusion matrix, ROC, feature importance
│       ├── classifier.js    ← Live classifier sliders + API calls
│       └── main.js          ← Nav, scroll effects, counters
└── README.md
```

---

## 🌐 Deploy to Render (Free)

1. Push this folder to a GitHub repo
2. Go to [render.com](https://render.com) → New → Web Service
3. Connect your repo
4. Set:
   - **Build command:** `npm install`
   - **Start command:** `npm start`
5. Click Deploy — live in ~2 minutes ✓

---

## 🌐 Deploy to Railway (Free)

```bash
npm install -g @railway/cli
railway login
railway init
railway up
```

---

## 🌐 Deploy to Vercel

```bash
npm install -g vercel
vercel
```

---

## 📊 Website Sections

| Section | Content |
|---|---|
| Hero | Project title, key stats (accuracy, dataset size) |
| About | Problem statement, dataset info, project pipeline |
| ECG Classes | All 5 classes explained with descriptions |
| Features | 8 time-domain features with formulas |
| Neural Network | Live canvas animation of the MLP |
| Results | Confusion matrix, ROC curves, feature importance |
| Live Classifier | Sliders → real-time ECG class prediction |
| Team | All team members + guide |

---

## 🛠 Tech Stack

- **Backend:** Node.js + Express
- **Frontend:** Vanilla HTML/CSS/JS (no framework needed)
- **Fonts:** Space Mono + Outfit (Google Fonts)
- **Classifier API:** `/api/classify` POST endpoint

---

## 📡 API

**POST** `/api/classify`

```json
{
  "mean": 0.012,
  "variance": 0.018,
  "rms": 0.21,
  "std": 0.13,
  "ptp": 0.82,
  "skewness": -0.04,
  "kurtosis": 2.1,
  "zeroCrossings": 18
}
```

**Response:**
```json
{
  "prediction": "Normal",
  "classIndex": 0,
  "color": "#00C896",
  "probabilities": [
    { "name": "Normal", "prob": 87.3, "color": "#00C896" },
    ...
  ]
}
```
