/* ============================================================
   Shoppers Intention AI — app.js
   Client-side prediction simulation · Particle BG · Live gauge
   
   ⚠️  IMPORTANT: The prediction function in this file is a
   CLIENT-SIDE SIMULATION for demo/portfolio purposes. It uses
   a weighted sigmoid formula to approximate the behavior of a
   RandomForestClassifier (89.25% accuracy) trained on the UCI
   Online Shoppers Purchasing Intention Dataset. It is NOT a
   real trained model — no .pkl file is loaded, no backend is
   contacted.
   ============================================================ */

(function () {
  'use strict';

  /* ══════════════════════════════════════════════════════════
     1. PARTICLE CANVAS BACKGROUND
     ══════════════════════════════════════════════════════════ */
  const canvas = document.getElementById('bg-canvas');
  const ctx = canvas.getContext('2d');
  let particles = [];
  const PARTICLE_COUNT = 45;
  const MAX_LINK_DIST = 140;
  let animFrameId;

  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  function createParticles() {
    particles = [];
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.35,
        vy: (Math.random() - 0.5) * 0.35,
        r: Math.random() * 2 + 1,
        opacity: Math.random() * 0.4 + 0.1,
      });
    }
  }

  function drawParticles() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw links
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < MAX_LINK_DIST) {
          const alpha = (1 - dist / MAX_LINK_DIST) * 0.12;
          ctx.strokeStyle = `rgba(0, 212, 255, ${alpha})`;
          ctx.lineWidth = 0.6;
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.stroke();
        }
      }
    }

    // Draw particles
    for (const p of particles) {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(0, 212, 255, ${p.opacity})`;
      ctx.fill();

      // Move
      p.x += p.vx;
      p.y += p.vy;

      // Wrap around edges
      if (p.x < -10) p.x = canvas.width + 10;
      if (p.x > canvas.width + 10) p.x = -10;
      if (p.y < -10) p.y = canvas.height + 10;
      if (p.y > canvas.height + 10) p.y = -10;
    }

    animFrameId = requestAnimationFrame(drawParticles);
  }

  resizeCanvas();
  createParticles();
  drawParticles();

  window.addEventListener('resize', () => {
    resizeCanvas();
    createParticles();
  });

  /* ══════════════════════════════════════════════════════════
     2. PREDICTION FUNCTION (Client-Side Simulation)
     ──────────────────────────────────────────────────────────
     This simulates a RandomForestClassifier's output using a
     weighted logistic (sigmoid) formula. The feature weights
     are inspired by typical feature importances from Random
     Forest models trained on the UCI dataset.

     Approach:
       1. Normalize each feature to [0, 1] using dataset
          min/max ranges.
       2. Compute weighted sum z (positive = more likely to buy).
       3. Apply sigmoid: P = 1 / (1 + e^(-z)).
       4. Clamp to [0.02, 0.98] for realism.
     ══════════════════════════════════════════════════════════ */

  // Dataset-derived min/max for normalization
  const FEATURE_RANGES = {
    administrative:          { min: 0, max: 27 },
    administrativeDuration:  { min: 0, max: 3400 },
    informational:           { min: 0, max: 24 },
    informationalDuration:   { min: 0, max: 2550 },
    productRelated:          { min: 0, max: 705 },
    productRelatedDuration:  { min: 0, max: 64000 },
    bounceRates:             { min: 0, max: 0.2 },
    exitRates:               { min: 0, max: 0.2 },
    pageValues:              { min: 0, max: 360 },
    specialDay:              { min: 0, max: 1 },
  };

  // Feature importance weights (positive = increases purchase probability)
  const WEIGHTS = {
    pageValues:              3.8,    // strongest positive signal
    exitRates:              -3.0,    // high exit rates → less likely to buy
    bounceRates:            -2.5,    // high bounce → less likely to buy
    productRelatedDuration:  1.6,    // longer browsing → more engagement
    productRelated:          0.8,    // more product pages → more intent
    administrativeDuration:  0.3,
    informationalDuration:   0.2,
    administrative:          0.15,
    informational:           0.1,
    specialDay:             -0.3,    // near special day → less likely (window shoppers)
    monthNov:                0.4,    // November (holiday season boost)
    monthDec:                0.25,   // December boost
    monthMay:                0.15,   // May slight boost
    returningVisitor:        0.2,    // returning visitors convert slightly more
    newVisitor:             -0.1,
    weekend:                -0.1,    // weekends slightly lower conversion
  };

  const BIAS = -1.8; // base bias (most sessions don't purchase: ~85% negative class)

  function normalize(value, min, max) {
    if (max === min) return 0;
    return Math.max(0, Math.min(1, (value - min) / (max - min)));
  }

  function sigmoid(z) {
    return 1.0 / (1.0 + Math.exp(-z));
  }

  /**
   * predictPurchaseProbability — computes a plausible [0,1] probability
   * from the 17 input features.
   *
   * @param {Object} inputs - all 17 feature values
   * @returns {number} probability in [0.02, 0.98]
   */
  function predictPurchaseProbability(inputs) {
    // Normalize continuous features
    const nPageValues       = normalize(inputs.pageValues,             FEATURE_RANGES.pageValues.min,             FEATURE_RANGES.pageValues.max);
    const nExitRates        = normalize(inputs.exitRates,              FEATURE_RANGES.exitRates.min,              FEATURE_RANGES.exitRates.max);
    const nBounceRates      = normalize(inputs.bounceRates,            FEATURE_RANGES.bounceRates.min,            FEATURE_RANGES.bounceRates.max);
    const nProdDuration     = normalize(inputs.productRelatedDuration, FEATURE_RANGES.productRelatedDuration.min, FEATURE_RANGES.productRelatedDuration.max);
    const nProdRelated      = normalize(inputs.productRelated,         FEATURE_RANGES.productRelated.min,         FEATURE_RANGES.productRelated.max);
    const nAdminDuration    = normalize(inputs.administrativeDuration, FEATURE_RANGES.administrativeDuration.min, FEATURE_RANGES.administrativeDuration.max);
    const nInfoDuration     = normalize(inputs.informationalDuration,  FEATURE_RANGES.informationalDuration.min,  FEATURE_RANGES.informationalDuration.max);
    const nAdmin            = normalize(inputs.administrative,         FEATURE_RANGES.administrative.min,         FEATURE_RANGES.administrative.max);
    const nInfo             = normalize(inputs.informational,          FEATURE_RANGES.informational.min,           FEATURE_RANGES.informational.max);
    const nSpecialDay       = normalize(inputs.specialDay,             FEATURE_RANGES.specialDay.min,             FEATURE_RANGES.specialDay.max);

    // Weighted sum
    let z = BIAS;
    z += WEIGHTS.pageValues              * nPageValues;
    z += WEIGHTS.exitRates               * nExitRates;
    z += WEIGHTS.bounceRates             * nBounceRates;
    z += WEIGHTS.productRelatedDuration  * nProdDuration;
    z += WEIGHTS.productRelated          * nProdRelated;
    z += WEIGHTS.administrativeDuration  * nAdminDuration;
    z += WEIGHTS.informationalDuration   * nInfoDuration;
    z += WEIGHTS.administrative          * nAdmin;
    z += WEIGHTS.informational           * nInfo;
    z += WEIGHTS.specialDay              * nSpecialDay;

    // Categorical: Month
    if (inputs.month === 'Nov') z += WEIGHTS.monthNov;
    else if (inputs.month === 'Dec') z += WEIGHTS.monthDec;
    else if (inputs.month === 'May') z += WEIGHTS.monthMay;

    // Categorical: Visitor Type
    if (inputs.visitorType === 'Returning_Visitor') z += WEIGHTS.returningVisitor;
    else if (inputs.visitorType === 'New_Visitor') z += WEIGHTS.newVisitor;

    // Boolean: Weekend
    if (inputs.weekend) z += WEIGHTS.weekend;

    // Sigmoid + clamp
    const prob = sigmoid(z);
    return Math.max(0.02, Math.min(0.98, prob));
  }

  /* ══════════════════════════════════════════════════════════
     3. DOM REFERENCES
     ══════════════════════════════════════════════════════════ */

  // Sliders
  const sliders = {
    administrative:          document.getElementById('administrative'),
    administrativeDuration:  document.getElementById('administrative-duration'),
    informational:           document.getElementById('informational'),
    informationalDuration:   document.getElementById('informational-duration'),
    productRelated:          document.getElementById('product-related'),
    productRelatedDuration:  document.getElementById('product-related-duration'),
    bounceRates:             document.getElementById('bounce-rates'),
    exitRates:               document.getElementById('exit-rates'),
    pageValues:              document.getElementById('page-values'),
    specialDay:              document.getElementById('special-day'),
  };

  // Value display spans
  const valueDisplays = {
    administrative:          document.getElementById('val-administrative'),
    administrativeDuration:  document.getElementById('val-administrative-duration'),
    informationalDuration:   document.getElementById('val-informational-duration'),
    informational:           document.getElementById('val-informational'),
    productRelated:          document.getElementById('val-product-related'),
    productRelatedDuration:  document.getElementById('val-product-related-duration'),
    bounceRates:             document.getElementById('val-bounce-rates'),
    exitRates:               document.getElementById('val-exit-rates'),
    pageValues:              document.getElementById('val-page-values'),
    specialDay:              document.getElementById('val-special-day'),
  };

  // Dropdowns
  const selects = {
    month:       document.getElementById('month'),
    visitorType: document.getElementById('visitor-type'),
    os:          document.getElementById('os'),
    browser:     document.getElementById('browser'),
    region:      document.getElementById('region'),
    trafficType: document.getElementById('traffic-type'),
  };

  // Toggle
  const weekendToggle = document.getElementById('weekend');

  // Gauge elements
  const gaugeArc     = document.getElementById('gauge-arc');
  const gaugePercent = document.getElementById('gauge-percent');
  const verdictBadge = document.getElementById('verdict-badge');
  const verdictIcon  = document.getElementById('verdict-icon');
  const verdictText  = document.getElementById('verdict-text');
  const confidFill   = document.getElementById('confidence-fill');

  // Gauge geometry
  const GAUGE_RADIUS = 85;
  const GAUGE_CIRCUMFERENCE = 2 * Math.PI * GAUGE_RADIUS; // ≈ 534.07

  /* ══════════════════════════════════════════════════════════
     4. GAUGE ANIMATION
     ══════════════════════════════════════════════════════════ */
  let currentDisplayedProb = 0;
  let targetProb = 0;
  let gaugeAnimating = false;

  function lerp(a, b, t) {
    return a + (b - a) * t;
  }

  /**
   * Returns an HSL color string interpolated from red (0%) → amber (50%) → green (100%).
   */
  function probToColor(p) {
    // Hue: 0 (red) → 45 (amber) → 142 (green)
    let hue;
    if (p < 0.5) {
      hue = lerp(0, 45, p / 0.5);
    } else {
      hue = lerp(45, 142, (p - 0.5) / 0.5);
    }
    return `hsl(${hue}, 85%, 55%)`;
  }

  function updateGaugeVisuals(prob) {
    const pct = Math.round(prob * 100);
    const offset = GAUGE_CIRCUMFERENCE * (1 - prob);
    const color = probToColor(prob);

    gaugeArc.style.strokeDashoffset = offset;
    gaugeArc.style.stroke = color;
    gaugeArc.style.filter = `drop-shadow(0 0 8px ${color})`;
    gaugePercent.textContent = pct + '%';
    gaugePercent.style.color = color;

    // Confidence bar
    confidFill.style.width = pct + '%';
    confidFill.style.background = color;

    // Verdict
    const willPurchase = prob >= 0.5;
    if (willPurchase) {
      verdictBadge.className = 'verdict-badge verdict-badge--purchase';
      verdictIcon.textContent = '✓';
      verdictText.textContent = 'Will Purchase';
    } else {
      verdictBadge.className = 'verdict-badge verdict-badge--no-purchase';
      verdictIcon.textContent = '✕';
      verdictText.textContent = 'Will Not Purchase';
    }
  }

  function animateGauge() {
    if (!gaugeAnimating) return;

    const diff = Math.abs(targetProb - currentDisplayedProb);
    if (diff < 0.001) {
      currentDisplayedProb = targetProb;
      updateGaugeVisuals(currentDisplayedProb);
      gaugeAnimating = false;
      return;
    }

    // Smooth easing — faster when far, slower when close
    const speed = 0.08;
    currentDisplayedProb = lerp(currentDisplayedProb, targetProb, speed);
    updateGaugeVisuals(currentDisplayedProb);
    requestAnimationFrame(animateGauge);
  }

  function setGaugeTarget(prob) {
    targetProb = prob;
    if (!gaugeAnimating) {
      gaugeAnimating = true;
      requestAnimationFrame(animateGauge);
    }
  }

  /* ══════════════════════════════════════════════════════════
     5. READ INPUTS & TRIGGER PREDICTION
     ══════════════════════════════════════════════════════════ */

  function readInputs() {
    return {
      administrative:          parseFloat(sliders.administrative.value),
      administrativeDuration:  parseFloat(sliders.administrativeDuration.value),
      informational:           parseFloat(sliders.informational.value),
      informationalDuration:   parseFloat(sliders.informationalDuration.value),
      productRelated:          parseFloat(sliders.productRelated.value),
      productRelatedDuration:  parseFloat(sliders.productRelatedDuration.value),
      bounceRates:             parseFloat(sliders.bounceRates.value),
      exitRates:               parseFloat(sliders.exitRates.value),
      pageValues:              parseFloat(sliders.pageValues.value),
      specialDay:              parseFloat(sliders.specialDay.value),
      month:                   selects.month.value,
      visitorType:             selects.visitorType.value,
      os:                      parseInt(selects.os.value, 10),
      browser:                 parseInt(selects.browser.value, 10),
      region:                  parseInt(selects.region.value, 10),
      trafficType:             parseInt(selects.trafficType.value, 10),
      weekend:                 weekendToggle.checked,
    };
  }

  function formatSliderValue(key, val) {
    if (key === 'bounceRates' || key === 'exitRates') {
      return parseFloat(val).toFixed(3);
    }
    if (key === 'specialDay') {
      return parseFloat(val).toFixed(1);
    }
    return Math.round(val).toLocaleString();
  }

  function onInputChange() {
    // Update displayed slider values
    for (const [key, slider] of Object.entries(sliders)) {
      if (valueDisplays[key]) {
        valueDisplays[key].textContent = formatSliderValue(key, slider.value);
      }
    }

    // Predict
    const inputs = readInputs();
    const prob = predictPurchaseProbability(inputs);
    setGaugeTarget(prob);
  }

  /* ══════════════════════════════════════════════════════════
     6. EVENT LISTENERS
     ══════════════════════════════════════════════════════════ */

  // Attach to all sliders
  for (const slider of Object.values(sliders)) {
    slider.addEventListener('input', onInputChange);
  }

  // Attach to all selects
  for (const select of Object.values(selects)) {
    select.addEventListener('change', onInputChange);
  }

  // Attach to toggle
  weekendToggle.addEventListener('change', onInputChange);

  /* ══════════════════════════════════════════════════════════
     7. FEATURE IMPORTANCE BAR CHART (HTML/CSS, no canvas lib)
     ══════════════════════════════════════════════════════════ */

  const IMPORTANCE_DATA = [
    { label: 'Page Values',        importance: 0.38, color: '#00d4ff' },
    { label: 'Exit Rates',         importance: 0.24, color: '#2563eb' },
    { label: 'Bounce Rates',       importance: 0.20, color: '#7c3aed' },
    { label: 'Product Duration',   importance: 0.18, color: '#ec4899' },
  ];

  function renderFeatureChart() {
    const container = document.getElementById('chart-bars');
    if (!container) return;

    const maxImportance = Math.max(...IMPORTANCE_DATA.map(d => d.importance));

    container.innerHTML = IMPORTANCE_DATA.map((item, i) => {
      const widthPct = (item.importance / maxImportance) * 100;
      const displayPct = Math.round(item.importance * 100);
      return `
        <div class="chart-bar-row" style="animation-delay: ${i * 0.12}s">
          <span class="chart-bar-row__label">${item.label}</span>
          <div class="chart-bar-row__track">
            <div class="chart-bar-row__fill"
                 data-width="${widthPct}"
                 style="background: linear-gradient(90deg, ${item.color}, ${item.color}88);">
            </div>
          </div>
          <span class="chart-bar-row__value">${displayPct}%</span>
        </div>
      `;
    }).join('');

    // Animate bars after a short delay (let the DOM render)
    requestAnimationFrame(() => {
      setTimeout(() => {
        const fills = container.querySelectorAll('.chart-bar-row__fill');
        fills.forEach(fill => {
          fill.style.width = fill.dataset.width + '%';
        });
      }, 200);
    });
  }

  // Use IntersectionObserver for chart entrance animation
  function initChartObserver() {
    const chartSection = document.querySelector('.chart-section');
    if (!chartSection) return;

    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              renderFeatureChart();
              observer.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.2 }
      );
      observer.observe(chartSection);
    } else {
      // Fallback: just render immediately
      renderFeatureChart();
    }
  }

  /* ══════════════════════════════════════════════════════════
     8. INITIALIZATION
     ══════════════════════════════════════════════════════════ */

  // Initial prediction with default values
  onInputChange();

  // Chart
  initChartObserver();

})();
