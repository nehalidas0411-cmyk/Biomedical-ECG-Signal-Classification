const CLASS_INFO = [
  { name: 'Normal Sinus Rhythm',           color: '#00C896', img: 'images/ecg_normal.png',  desc: 'Regular P-QRS-T pattern. Consistent intervals and normal amplitude.' },
  { name: 'Supraventricular Ectopic Beat', color: '#FF4B6E', img: 'images/ecg_supra.png',   desc: 'Premature beat above ventricles. Irregular P-wave, narrow but early QRS.' },
  { name: 'Ventricular Ectopic Beat',      color: '#FFD93D', img: 'images/ecg_ventri.png',  desc: 'Wide bizarre QRS. No preceding P-wave. Deep compensatory pause after.' },
  { name: 'Fusion Beat',                   color: '#7c6bff', img: 'images/ecg_fusion.png',  desc: 'Hybrid of normal + ventricular. Intermediate QRS width and morphology.' },
  { name: 'Unknown / Paced Beat',          color: '#74B9FF', img: 'images/ecg_unknown.png', desc: 'Pacemaker-induced or unclassifiable. Pacing spike visible before QRS.' },
];

window.switchClass = function(cls) {
  const info = CLASS_INFO[cls];
  document.getElementById('waveImage').src         = info.img;
  document.getElementById('waveTitle').textContent = info.name;
  document.getElementById('waveTitle').style.color = info.color;
  document.getElementById('waveDesc').textContent  = info.desc;

  document.querySelectorAll('.wave-tab').forEach((btn, i) => {
    const isActive = i === cls;
    btn.classList.toggle('active', isActive);
    btn.style.borderColor = isActive ? CLASS_INFO[i].color : 'var(--border)';
    btn.style.color       = isActive ? CLASS_INFO[i].color : 'var(--text2)';
    btn.style.background  = isActive ? 'rgba(255,255,255,0.04)' : 'transparent';
  });
};
