/* ════════════════════════════════════════════════════════
   The Oracle — app.js · v2.0
   Enhanced constellation · liquid gauge · feature weights
   ────────────────────────────────────────────────────────
   The predictPurchaseProbability function simulates a
   Random Forest classifier via a weighted logistic curve.
   ════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  /* ═══ 1. CONSTELLATION CANVAS ══════════════════════════ */
  const canvas = document.getElementById('stars');
  const ctx = canvas.getContext('2d');
  let stars = [];
  const STAR_COUNT = 90;
  const LINK_DIST = 140;
  let mouse = { x: -1000, y: -1000 };
  const MOUSE_DIST = 180;

  function resize() {
    canvas.width = window.innerWidth * devicePixelRatio;
    canvas.height = window.innerHeight * devicePixelRatio;
    canvas.style.width = window.innerWidth + 'px';
    canvas.style.height = window.innerHeight + 'px';
    ctx.scale(devicePixelRatio, devicePixelRatio);
  }

  function spawn() {
    stars = [];
    for (let i = 0; i < STAR_COUNT; i++) {
      stars.push({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        vx: (Math.random() - 0.5) * 0.15,
        vy: (Math.random() - 0.5) * 0.15,
        r: Math.random() * 1.4 + 0.3,
        a: Math.random() * 0.5 + 0.15,
        twinkle: Math.random() * Math.PI * 2,
        twinkleSpeed: 0.008 + Math.random() * 0.02,
      });
    }
  }

  function draw() {
    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

    // Mouse interaction — attract stars slightly toward cursor
    for (const s of stars) {
      const dx = mouse.x - s.x;
      const dy = mouse.y - s.y;
      const d = Math.sqrt(dx * dx + dy * dy);
      if (d < MOUSE_DIST && d > 0) {
        const force = (1 - d / MOUSE_DIST) * 0.003;
        s.vx += dx * force;
        s.vy += dy * force;
      }
      // Dampen velocity
      s.vx *= 0.998;
      s.vy *= 0.998;
    }

    // Links
    for (let i = 0; i < stars.length; i++) {
      for (let j = i + 1; j < stars.length; j++) {
        const dx = stars[i].x - stars[j].x;
        const dy = stars[i].y - stars[j].y;
        const d = Math.sqrt(dx * dx + dy * dy);
        if (d < LINK_DIST) {
          const alpha = (1 - d / LINK_DIST) * 0.12;
          ctx.strokeStyle = `rgba(255, 107, 53, ${alpha})`;
          ctx.lineWidth = 0.5;
          ctx.beginPath();
          ctx.moveTo(stars[i].x, stars[i].y);
          ctx.lineTo(stars[j].x, stars[j].y);
          ctx.stroke();
        }
      }
    }

    // Stars with multi-color twinkle
    const colors = [
      [255, 107, 53],   // accent
      [139, 92, 246],   // violet
      [238, 240, 246],  // paper
    ];

    for (const s of stars) {
      s.twinkle += s.twinkleSpeed;
      const flicker = (Math.sin(s.twinkle) + 1) / 2;
      const colorIdx = Math.floor(s.twinkle * 0.3) % colors.length;
      const c = colors[colorIdx];

      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r * (0.8 + flicker * 0.4), 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${c[0]}, ${c[1]}, ${c[2]}, ${s.a * (0.4 + flicker * 0.6)})`;
      ctx.fill();

      // Glow for brighter stars
      if (s.r > 1) {
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r * 3, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${c[0]}, ${c[1]}, ${c[2]}, ${s.a * flicker * 0.08})`;
        ctx.fill();
      }

      s.x += s.vx;
      s.y += s.vy;

      if (s.x < -10) s.x = window.innerWidth + 10;
      if (s.x > window.innerWidth + 10) s.x = -10;
      if (s.y < -10) s.y = window.innerHeight + 10;
      if (s.y > window.innerHeight + 10) s.y = -10;
    }

    requestAnimationFrame(draw);
  }

  resize();
  spawn();
  draw();
  window.addEventListener('resize', () => { resize(); spawn(); });
  document.addEventListener('mousemove', (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
  });

  /* ═══ 1b. GLASS CARD HOVER TRACKING ════════════════════ */
  document.querySelectorAll('.glass').forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      card.style.setProperty('--mx', x + '%');
      card.style.setProperty('--my', y + '%');
    });
  });

  /* ═══ 2. DIAL TICKS (decorative) ═══════════════════════ */
  const ticksGroup = document.getElementById('dial-ticks');
  if (ticksGroup) {
    let ticks = '';
    for (let i = 0; i < 36; i++) {
      const a = (i / 36) * Math.PI * 2;
      const isMain = i % 3 === 0;
      const innerR = isMain ? 98 : 100;
      const outerR = 106;
      const x1 = 110 + Math.cos(a) * innerR;
      const y1 = 110 + Math.sin(a) * innerR;
      const x2 = 110 + Math.cos(a) * outerR;
      const y2 = 110 + Math.sin(a) * outerR;
      const opacity = isMain ? 0.35 : 0.15;
      ticks += `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" style="opacity:${opacity}"/>`;
    }
    ticksGroup.innerHTML = ticks;
  }

  /* ═══ 3. PREDICTION (weighted sigmoid simulation) ══════ */
  const RANGES = {
    pageValues:             { min: 0, max: 360 },
    exitRates:              { min: 0, max: 0.2 },
    bounceRates:            { min: 0, max: 0.2 },
    productRelatedDuration: { min: 0, max: 64000 },
    productRelated:         { min: 0, max: 705 },
    administrativeDuration: { min: 0, max: 3400 },
    informationalDuration:  { min: 0, max: 2550 },
    administrative:         { min: 0, max: 27 },
    informational:          { min: 0, max: 24 },
    specialDay:             { min: 0, max: 1 },
  };

  // Returns impact objects so we can explain WHY the prediction
  const FEATURES = [
    { key: 'pageValues',             label: 'Page Value',          weight:  3.8 },
    { key: 'exitRates',              label: 'Exit Rate',           weight: -3.0 },
    { key: 'bounceRates',            label: 'Bounce Rate',         weight: -2.5 },
    { key: 'productRelatedDuration', label: 'Product Duration',    weight:  1.6 },
    { key: 'productRelated',         label: 'Product Pages',       weight:  0.8 },
    { key: 'administrativeDuration', label: 'Admin Duration',      weight:  0.3 },
    { key: 'informationalDuration',  label: 'Info Duration',       weight:  0.2 },
    { key: 'administrative',         label: 'Admin Pages',         weight:  0.15 },
    { key: 'informational',          label: 'Info Pages',          weight:  0.1 },
    { key: 'specialDay',             label: 'Special Day',         weight: -0.3 },
  ];

  const BIAS = -1.8;

  function norm(v, lo, hi) {
    if (hi === lo) return 0;
    return Math.max(0, Math.min(1, (v - lo) / (hi - lo)));
  }

  function sigmoid(z) { return 1 / (1 + Math.exp(-z)); }

  function predict(inputs) {
    const n = {};
    for (const f of FEATURES) n[f.key] = norm(inputs[f.key], RANGES[f.key].min, RANGES[f.key].max);

    let z = BIAS;
    const impacts = [];
    for (const f of FEATURES) {
      const contribution = f.weight * n[f.key];
      z += contribution;
      impacts.push({
        label: f.label,
        key: f.key,
        contribution,
        normalized: n[f.key],
        raw: inputs[f.key],
        weight: f.weight,
      });
    }

    // categorical boosts
    if (inputs.month === 'Nov') z += 0.4;
    else if (inputs.month === 'Dec') z += 0.25;
    else if (inputs.month === 'May') z += 0.15;

    if (inputs.visitorType === 'Returning_Visitor') z += 0.2;
    else if (inputs.visitorType === 'New_Visitor') z -= 0.1;

    if (inputs.weekend) z -= 0.1;

    const prob = sigmoid(z);
    return {
      prob: Math.max(0.02, Math.min(0.98, prob)),
      impacts,
    };
  }

  /* ═══ 4. DOM REFERENCES ════════════════════════════════ */
  const sliderIds = ['administrative','administrative-duration','informational',
    'informational-duration','product-related','product-related-duration',
    'bounce-rates','exit-rates','page-values','special-day'];

  const sliders = {};
  const displays = {};
  for (const id of sliderIds) {
    sliders[id] = document.getElementById(id);
    displays[id] = document.getElementById('val-' + id);
  }

  const selects = {
    month: document.getElementById('month'),
    'visitor-type': document.getElementById('visitor-type'),
    os: document.getElementById('os'),
    browser: document.getElementById('browser'),
    region: document.getElementById('region'),
    'traffic-type': document.getElementById('traffic-type'),
  };

  const weekend = document.getElementById('weekend');

  const dialFill    = document.getElementById('dial-fill');
  const dialGlow    = document.getElementById('dial-glow');
  const verdictNum  = document.getElementById('verdict-percent');
  const verdictCall = document.getElementById('verdict-call');
  const verdictIcon = document.getElementById('verdict-icon');
  const verdictText = document.getElementById('verdict-text');
  const confidPct   = document.getElementById('confid-pct');
  const confidFill  = document.getElementById('confid-fill');
  const whyList     = document.getElementById('verdict-why');

  const DIAL_CIRC = 2 * Math.PI * 92; // ≈ 578.05
  dialFill.setAttribute('stroke-dasharray', DIAL_CIRC);
  dialFill.setAttribute('stroke-dashoffset', DIAL_CIRC);
  dialGlow.setAttribute('stroke-dasharray', DIAL_CIRC);
  dialGlow.setAttribute('stroke-dashoffset', DIAL_CIRC);

  /* ═══ 5. INPUT HANDLING ════════════════════════════════ */
  function readInputs() {
    return {
      administrative:         +sliders.administrative.value,
      administrativeDuration: +sliders['administrative-duration'].value,
      informational:          +sliders.informational.value,
      informationalDuration:  +sliders['informational-duration'].value,
      productRelated:         +sliders['product-related'].value,
      productRelatedDuration: +sliders['product-related-duration'].value,
      bounceRates:            +sliders['bounce-rates'].value,
      exitRates:              +sliders['exit-rates'].value,
      pageValues:             +sliders['page-values'].value,
      specialDay:             +sliders['special-day'].value,
      month:                  selects.month.value,
      visitorType:            selects['visitor-type'].value,
      os:                     +selects.os.value,
      browser:                +selects.browser.value,
      region:                 +selects.region.value,
      trafficType:            +selects['traffic-type'].value,
      weekend:                weekend.checked,
    };
  }

  function fmt(key, v) {
    if (key === 'bounce-rates' || key === 'exit-rates') return (+v).toFixed(3);
    if (key === 'special-day') return (+v).toFixed(1);
    return Math.round(v).toLocaleString();
  }

  function paintSliderTrack(el) {
    const min = +el.min, max = +el.max, v = +el.value;
    const p = ((v - min) / (max - min)) * 100;
    el.style.setProperty('--p', p + '%');
  }

  function paintSliderValues() {
    for (const [id, el] of Object.entries(sliders)) {
      paintSliderTrack(el);
      displays[id].textContent = fmt(id, el.value);
    }
  }

  /* ═══ 6. GAUGE ANIMATION (smooth eased) ════════════════ */
  let displayed = 0;
  let target = 0;
  let animating = false;

  function lerp(a, b, t) { return a + (b - a) * t; }

  function probToAccent(p) {
    if (p < 0.35) return '#ef4444';
    if (p < 0.55) return '#ff6b35';
    if (p < 0.7)  return '#f59e0b';
    return '#10b981';
  }

  function update(p, impacts) {
    const pct = Math.round(p * 100);
    const offset = DIAL_CIRC * (1 - p);
    dialFill.setAttribute('stroke-dashoffset', offset);
    dialGlow.setAttribute('stroke-dashoffset', offset);
    const accent = probToAccent(p);
    dialGlow.setAttribute('stroke', accent);
    dialGlow.style.opacity = 0.15 + p * 0.35;

    // Animate count-up
    animateNumber(verdictNum, pct);

    // Verdict call
    if (p >= 0.5) {
      verdictCall.className = 'verdict__call is-purchase';
      verdictIcon.textContent = '✓';
      verdictText.textContent = 'Will purchase';
    } else {
      verdictCall.className = 'verdict__call is-no';
      verdictIcon.textContent = '×';
      verdictText.textContent = 'Won\'t purchase';
    }

    // Confidence
    const conf = Math.round(p * 100);
    confidPct.textContent = conf + '%';
    confidFill.style.width = conf + '%';
    confidFill.style.background = `linear-gradient(90deg, ${accent}, ${probToAccent(Math.min(1, p + 0.15))})`;

    // Top drivers
    const top = [...impacts]
      .sort((a, b) => Math.abs(b.contribution) - Math.abs(a.contribution))
      .slice(0, 3);

    whyList.innerHTML = top.map(i => {
      const up = i.contribution > 0;
      const sign = up ? '+' : '';
      return `
        <li>
          <span class="why-label">${i.label}</span>
          <span class="why-impact ${up ? 'up' : 'down'}">${sign}${i.contribution.toFixed(2)}</span>
        </li>`;
    }).join('');
  }

  let displayedPct = 0;
  function animateNumber(el, target) {
    const start = displayedPct;
    const dur = 700;
    const t0 = performance.now();
    function tick(t) {
      const k = Math.min(1, (t - t0) / dur);
      const eased = 1 - Math.pow(1 - k, 3);
      displayedPct = Math.round(lerp(start, target, eased));
      el.textContent = displayedPct;
      if (k < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  function animateDial() {
    if (!animating) return;
    const diff = Math.abs(target - displayed);
    if (diff < 0.001) {
      displayed = target;
      animating = false;
      return;
    }
    displayed = lerp(displayed, target, 0.1);
    requestAnimationFrame(animateDial);
  }

  function setTarget(p) {
    target = p;
    if (!animating) {
      animating = true;
      requestAnimationFrame(animateDial);
    }
  }

  /* ═══ 7. INPUT CHANGE PIPELINE ════════════════════════ */
  function onChange() {
    paintSliderValues();
    const inputs = readInputs();
    const { prob, impacts } = predict(inputs);
    update(prob, impacts);
    setTarget(prob);
  }

  for (const el of Object.values(sliders)) el.addEventListener('input', onChange);
  for (const el of Object.values(selects)) el.addEventListener('change', onChange);
  weekend.addEventListener('change', onChange);

  /* ═══ 8. FEATURE WEIGHT CHART ══════════════════════════ */
  const WEIGHTS = [
    { label: 'Page Value',         pct: 0.38, color: '#ff6b35' },
    { label: 'Exit Rate',          pct: 0.24, color: '#f43f5e' },
    { label: 'Bounce Rate',        pct: 0.20, color: '#8b5cf6' },
    { label: 'Product Duration',   pct: 0.18, color: '#06b6d4' },
    { label: 'Product Pages',      pct: 0.10, color: '#10b981' },
    { label: 'Admin Duration',     pct: 0.06, color: '#6b7094' },
  ];

  const weightsEl = document.getElementById('weights');
  if (weightsEl) {
    const max = Math.max(...WEIGHTS.map(w => w.pct));
    weightsEl.innerHTML = WEIGHTS.map(w => {
      const width = (w.pct / max) * 100;
      return `
        <div class="weight-row">
          <span class="weight-row__label">${w.label}</span>
          <div class="weight-row__bar">
            <div class="weight-row__fill" data-w="${width}"
                 style="background: linear-gradient(90deg, ${w.color}, ${w.color}60);"></div>
          </div>
          <span class="weight-row__pct">${Math.round(w.pct * 100)}%</span>
        </div>`;
    }).join('');

    // Animate fills
    setTimeout(() => {
      weightsEl.querySelectorAll('.weight-row__fill').forEach(f => {
        f.style.width = f.dataset.w + '%';
      });
    }, 300);
  }

  /* ═══ 9. SCROLL REVEAL ═════════════════════════════════ */
  const reveals = document.querySelectorAll('.card');
  reveals.forEach(el => el.classList.add('reveal'));

  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add('is-in');
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.1 });
    reveals.forEach(el => io.observe(el));
  } else {
    reveals.forEach(el => el.classList.add('is-in'));
  }

  /* ═══ 10. SMOOTH NAV SCROLL HIGHLIGHT ═════════════════ */
  const navLinks = document.querySelectorAll('.masthead__nav a');
  const sections = document.querySelectorAll('[id]');

  function highlightNav() {
    let current = '';
    sections.forEach(section => {
      const top = section.getBoundingClientRect().top;
      if (top < window.innerHeight * 0.4) {
        current = section.id;
      }
    });
    navLinks.forEach(link => {
      link.style.color = link.getAttribute('href') === '#' + current
        ? '#ff6b35'
        : '';
      link.style.background = link.getAttribute('href') === '#' + current
        ? 'rgba(255, 107, 53, 0.08)'
        : '';
    });
  }
  window.addEventListener('scroll', highlightNav, { passive: true });

  /* ═══ 11. INIT ════════════════════════════════════════ */
  paintSliderValues();
  onChange();
  highlightNav();

})();
