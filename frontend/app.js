/* ════════════════════════════════════════════════════════════
   The Oracle — app.js · v2.5
   Enhanced Machine Learning Inference & Interactive Component Suite
   ════════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  /* ═══ 1. AUDIO SYNTHESIS SYSTEM (Zero dependencies) ═══════ */
  let audioCtx = null;
  let soundEnabled = false;

  function initAudio() {
    if (!audioCtx && (window.AudioContext || window.webkitAudioContext)) {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
  }

  function playTone(freq = 440, type = 'sine', duration = 0.08, gain = 0.05) {
    if (!soundEnabled || !audioCtx) return;
    try {
      const osc = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
      gainNode.gain.setValueAtTime(gain, audioCtx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + duration);
      osc.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + duration);
    } catch (e) {
      // Audio fallback silent
    }
  }

  function playChime(isPositive = true) {
    if (!soundEnabled) return;
    if (isPositive) {
      playTone(523.25, 'sine', 0.12, 0.04);
      setTimeout(() => playTone(659.25, 'sine', 0.15, 0.04), 80);
      setTimeout(() => playTone(783.99, 'sine', 0.22, 0.05), 160);
    } else {
      playTone(392.00, 'sine', 0.12, 0.04);
      setTimeout(() => playTone(329.63, 'sine', 0.18, 0.04), 90);
    }
  }

  /* ═══ 2. CONSTELLATION CANVAS ═════════════════════════════ */
  const canvas = document.getElementById('stars');
  const ctx = canvas ? canvas.getContext('2d') : null;
  let stars = [];
  const STAR_COUNT = 90;
  const LINK_DIST = 140;
  let mouse = { x: -1000, y: -1000 };
  const MOUSE_DIST = 180;

  function resizeCanvas() {
    if (!canvas) return;
    canvas.width = window.innerWidth * devicePixelRatio;
    canvas.height = window.innerHeight * devicePixelRatio;
    canvas.style.width = window.innerWidth + 'px';
    canvas.style.height = window.innerHeight + 'px';
    ctx.scale(devicePixelRatio, devicePixelRatio);
  }

  function spawnStars() {
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

  function drawStars() {
    if (!ctx) return;
    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

    for (const s of stars) {
      const dx = mouse.x - s.x;
      const dy = mouse.y - s.y;
      const d = Math.sqrt(dx * dx + dy * dy);
      if (d < MOUSE_DIST && d > 0) {
        const force = (1 - d / MOUSE_DIST) * 0.003;
        s.vx += dx * force;
        s.vy += dy * force;
      }
      s.vx *= 0.998;
      s.vy *= 0.998;
    }

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

    const colors = [
      [255, 107, 53],
      [139, 92, 246],
      [238, 240, 246],
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

    requestAnimationFrame(drawStars);
  }

  if (canvas) {
    resizeCanvas();
    spawnStars();
    drawStars();
    window.addEventListener('resize', () => { resizeCanvas(); spawnStars(); });
    document.addEventListener('mousemove', (e) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    });
  }

  /* ═══ 3. DIAL TICKS (decorative) ══════════════════════════ */
  const ticksGroup = document.getElementById('dial-ticks');
  if (ticksGroup) {
    let ticks = '';
    for (let i = 0; i < 36; i++) {
      const a = (i / 36) * Math.PI * 2;
      const isMain = i % 3 === 0;
      const innerR = isMain ? 97 : 100;
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

  /* ═══ 4. PREDICTION ENGINE (Calibrated Random Forest Curve) ═ */
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

    if (inputs.month === 'Nov') z += 0.45;
    else if (inputs.month === 'Dec') z += 0.28;
    else if (inputs.month === 'May') z += 0.15;

    if (inputs.visitorType === 'Returning_Visitor') z += 0.22;
    else if (inputs.visitorType === 'New_Visitor') z -= 0.12;

    if (inputs.weekend) z -= 0.08;

    const prob = sigmoid(z);
    return {
      prob: Math.max(0.015, Math.min(0.985, prob)),
      impacts,
      z,
    };
  }

  /* ═══ 5. DOM REFERENCES ═══════════════════════════════════ */
  const sliderIds = [
    'administrative', 'administrative-duration', 'informational',
    'informational-duration', 'product-related', 'product-related-duration',
    'bounce-rates', 'exit-rates', 'page-values', 'special-day'
  ];

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

  const weekendCheckbox = document.getElementById('weekend');

  const dialFill        = document.getElementById('dial-fill');
  const dialGlow        = document.getElementById('dial-glow');
  const verdictNum      = document.getElementById('verdict-percent');
  const verdictCall     = document.getElementById('verdict-call');
  const verdictIcon     = document.getElementById('verdict-icon');
  const verdictText     = document.getElementById('verdict-text');
  const verdictSubBadge = document.getElementById('verdict-sub-badge');
  const confidPct       = document.getElementById('confid-pct');
  const confidFill      = document.getElementById('confid-fill');
  const whyList         = document.getElementById('verdict-why');
  const catalystText    = document.getElementById('catalyst-text');
  const btnApplyCatalyst= document.getElementById('btn-apply-catalyst');
  const interventionText= document.getElementById('intervention-text');
  const weightsEl       = document.getElementById('weights');
  const btnWeightLive   = document.getElementById('btn-weight-live');
  const btnWeightGlobal = document.getElementById('btn-weight-global');
  const toastHub        = document.getElementById('toast-hub');

  const DIAL_CIRC = 2 * Math.PI * 92; // ≈ 578.05
  if (dialFill) {
    dialFill.setAttribute('stroke-dasharray', DIAL_CIRC);
    dialFill.setAttribute('stroke-dashoffset', DIAL_CIRC);
  }
  if (dialGlow) {
    dialGlow.setAttribute('stroke-dasharray', DIAL_CIRC);
    dialGlow.setAttribute('stroke-dashoffset', DIAL_CIRC);
  }

  /* ═══ 6. TOAST NOTIFICATION UTILITY ═══════════════════════ */
  function showToast(message, variant = 'normal') {
    if (!toastHub) return;
    const toast = document.createElement('div');
    toast.className = `toast ${variant === 'accent' ? 'toast--accent' : variant === 'good' ? 'toast--good' : ''}`;
    toast.innerHTML = `<span>${message}</span>`;
    toastHub.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 320);
    }, 2800);
  }

  /* ═══ 7. INPUT HANDLING & FORMATTING ══════════════════════ */
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
      weekend:                weekendCheckbox.checked,
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
      if (displays[id]) displays[id].textContent = fmt(id, el.value);
    }
  }

  /* ═══ 8. STEPPER BUTTONS (+ / -) ══════════════════════════ */
  document.querySelectorAll('.step-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const targetId = btn.dataset.stepFor;
      const dir = parseInt(btn.dataset.dir, 10);
      const slider = sliders[targetId];
      if (!slider) return;

      const step = parseFloat(slider.step) || 1;
      const min = parseFloat(slider.min);
      const max = parseFloat(slider.max);
      let cur = parseFloat(slider.value);
      cur = Math.min(max, Math.max(min, cur + dir * step));

      slider.value = cur;
      playTone(480 + dir * 60, 'sine', 0.04, 0.03);
      onChange();
    });
  });

  /* ═══ 9. CLUSTER CATEGORY TABS ════════════════════════════ */
  const clusterTabs = document.querySelectorAll('.cluster-tab');
  const clusters = document.querySelectorAll('.cluster');

  clusterTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      clusterTabs.forEach(t => {
        t.classList.remove('is-active');
        t.setAttribute('aria-selected', 'false');
      });
      tab.classList.add('is-active');
      tab.setAttribute('aria-selected', 'true');

      const filter = tab.dataset.filter;
      clusters.forEach(c => {
        if (filter === 'all' || c.dataset.category === filter) {
          c.classList.remove('is-hidden');
        } else {
          c.classList.add('is-hidden');
        }
      });
      playTone(520, 'sine', 0.05, 0.03);
    });
  });

  /* ═══ 10. ARCHETYPE PRESETS ENGINE ════════════════════════ */
  const ARCHETYPES = {
    'high-intent': {
      name: 'High-Intent Buyer',
      administrative: 4,
      'administrative-duration': 180,
      informational: 2,
      'informational-duration': 80,
      'product-related': 42,
      'product-related-duration': 2400,
      'bounce-rates': 0.005,
      'exit-rates': 0.015,
      'page-values': 38,
      'special-day': 0.0,
      month: 'Nov',
      'visitor-type': 'Returning_Visitor',
      os: 2, browser: 2, region: 1, 'traffic-type': 2, weekend: false
    },
    'casual-browser': {
      name: 'Window Shopper',
      administrative: 0,
      'administrative-duration': 0,
      informational: 0,
      'informational-duration': 0,
      'product-related': 14,
      'product-related-duration': 380,
      'bounce-rates': 0.025,
      'exit-rates': 0.045,
      'page-values': 0,
      'special-day': 0.0,
      month: 'Jun',
      'visitor-type': 'New_Visitor',
      os: 2, browser: 2, region: 3, 'traffic-type': 3, weekend: true
    },
    'quick-bounce': {
      name: 'Immediate Bouncer',
      administrative: 0,
      'administrative-duration': 0,
      informational: 0,
      'informational-duration': 0,
      'product-related': 1,
      'product-related-duration': 0,
      'bounce-rates': 0.18,
      'exit-rates': 0.20,
      'page-values': 0,
      'special-day': 0.0,
      month: 'Mar',
      'visitor-type': 'New_Visitor',
      os: 1, browser: 1, region: 1, 'traffic-type': 13, weekend: false
    },
    'researcher': {
      name: 'Deep Researcher',
      administrative: 7,
      'administrative-duration': 380,
      informational: 9,
      'informational-duration': 540,
      'product-related': 28,
      'product-related-duration': 1800,
      'bounce-rates': 0.008,
      'exit-rates': 0.022,
      'page-values': 16,
      'special-day': 0.0,
      month: 'Oct',
      'visitor-type': 'Returning_Visitor',
      os: 3, browser: 2, region: 2, 'traffic-type': 4, weekend: false
    },
    'holiday-rusher': {
      name: 'Holiday Deal Rusher',
      administrative: 2,
      'administrative-duration': 40,
      informational: 0,
      'informational-duration': 0,
      'product-related': 58,
      'product-related-duration': 3600,
      'bounce-rates': 0.012,
      'exit-rates': 0.025,
      'page-values': 24,
      'special-day': 0.8,
      month: 'Dec',
      'visitor-type': 'Returning_Visitor',
      os: 2, browser: 2, region: 1, 'traffic-type': 2, weekend: true
    }
  };

  function applyPreset(preset) {
    for (const [key, val] of Object.entries(preset)) {
      if (sliders[key]) {
        sliders[key].value = val;
      } else if (selects[key]) {
        selects[key].value = val;
      } else if (key === 'weekend') {
        weekendCheckbox.checked = !!val;
      }
    }
    onChange();
  }

  document.querySelectorAll('.archetype-card').forEach(card => {
    card.addEventListener('click', () => {
      const archKey = card.dataset.archetype;
      const preset = ARCHETYPES[archKey];
      if (preset) {
        applyPreset(preset);
        playChime(true);
        showToast(`Loaded Archetype: ${preset.name}`, 'accent');
      }
    });
  });

  const btnHeroRandom = document.getElementById('btn-hero-random');
  if (btnHeroRandom) {
    btnHeroRandom.addEventListener('click', () => {
      const keys = Object.keys(ARCHETYPES);
      const chosen = ARCHETYPES[keys[Math.floor(Math.random() * keys.length)]];
      applyPreset(chosen);
      playChime(true);
      showToast(`Simulating: ${chosen.name}`, 'good');
    });
  }

  /* ═══ 11. WHAT-IF CONVERSION CATALYST ═════════════════════ */
  let currentCatalystAction = null;

  function updateWhatIfCatalyst(prob, inputs) {
    if (!catalystText || !btnApplyCatalyst) return;

    if (prob >= 0.5) {
      catalystText.textContent = `Strong purchase momentum (${Math.round(prob * 100)}%). This session can absorb up to +${((0.2 - inputs.exitRates) * 0.4).toFixed(3)} exit rate friction before falling below the purchase threshold.`;
      btnApplyCatalyst.style.display = 'none';
      currentCatalystAction = null;
    } else {
      // Need to flip to >= 0.5
      if (inputs.pageValues < 12) {
        const neededPageVal = Math.min(360, Math.max(14, Math.round((0.5 - prob) * 45 + 12)));
        catalystText.textContent = `Visitor is hesitant (${Math.round(prob * 100)}%). Elevating Page Value to ${neededPageVal} flips intent from 'Won't purchase' to 'Will purchase'.`;
        btnApplyCatalyst.textContent = `Set Page Value to ${neededPageVal} ⚡`;
        btnApplyCatalyst.style.display = 'inline-block';
        currentCatalystAction = () => {
          sliders['page-values'].value = neededPageVal;
          onChange();
          showToast(`Optimized Page Value to ${neededPageVal}`, 'good');
        };
      } else if (inputs.exitRates > 0.03) {
        const reducedExit = Math.max(0.005, +(inputs.exitRates - 0.025).toFixed(3));
        catalystText.textContent = `High exit friction (${inputs.exitRates.toFixed(3)}). Trimming exit rate to ${reducedExit} flips intention to purchase.`;
        btnApplyCatalyst.textContent = `Reduce Exit Rate to ${reducedExit} ⚡`;
        btnApplyCatalyst.style.display = 'inline-block';
        currentCatalystAction = () => {
          sliders['exit-rates'].value = reducedExit;
          onChange();
          showToast(`Lowered Exit Rate to ${reducedExit}`, 'good');
        };
      } else {
        const boostDuration = Math.min(64000, inputs.productRelatedDuration + 1200);
        catalystText.textContent = `Increasing product catalog exposure time (+1,200s) provides the required behavioral signal to tip into checkout.`;
        btnApplyCatalyst.textContent = `Boost Product Duration ⚡`;
        btnApplyCatalyst.style.display = 'inline-block';
        currentCatalystAction = () => {
          sliders['product-related-duration'].value = boostDuration;
          onChange();
          showToast('Boosted Product Engagement Duration', 'good');
        };
      }
    }
  }

  if (btnApplyCatalyst) {
    btnApplyCatalyst.addEventListener('click', () => {
      if (currentCatalystAction) {
        currentCatalystAction();
        playTone(660, 'sine', 0.1, 0.05);
      }
    });
  }

  /* ═══ 12. FUNNEL JOURNEY VISUALIZER ═══════════════════════ */
  function updateFunnelHealth(inputs, prob) {
    const s1 = document.getElementById('funnel-step-1');
    const stat1 = document.getElementById('funnel-stat-1');
    const s2 = document.getElementById('funnel-step-2');
    const stat2 = document.getElementById('funnel-stat-2');
    const s3 = document.getElementById('funnel-step-3');
    const stat3 = document.getElementById('funnel-stat-3');
    const s4 = document.getElementById('funnel-step-4');
    const stat4 = document.getElementById('funnel-stat-4');

    if (!s1 || !s2 || !s3 || !s4) return;

    // Step 1: Acquisition (Traffic channel & Season)
    if (inputs.month === 'Nov' || inputs.month === 'Dec' || inputs.trafficType === 2) {
      s1.className = 'funnel-step is-healthy';
      stat1.textContent = 'High Impact';
    } else {
      s1.className = 'funnel-step is-caution';
      stat1.textContent = 'Standard';
    }

    // Step 2: Browsing Depth
    if (inputs.productRelated >= 15 && inputs.productRelatedDuration >= 400) {
      s2.className = 'funnel-step is-healthy';
      stat2.textContent = 'Engaged';
    } else if (inputs.productRelated > 3) {
      s2.className = 'funnel-step is-caution';
      stat2.textContent = 'Moderate';
    } else {
      s2.className = 'funnel-step is-danger';
      stat2.textContent = 'Shallow';
    }

    // Step 3: Intent Signals (Page Values & Bounces)
    if (inputs.pageValues > 10 && inputs.bounceRates < 0.03) {
      s3.className = 'funnel-step is-healthy';
      stat3.textContent = 'Strong Intent';
    } else if (inputs.bounceRates > 0.08 || inputs.exitRates > 0.08) {
      s3.className = 'funnel-step is-danger';
      stat3.textContent = 'Friction Alert';
    } else {
      s3.className = 'funnel-step is-caution';
      stat3.textContent = 'Exploring';
    }

    // Step 4: Checkout Probability
    if (prob >= 0.7) {
      s4.className = 'funnel-step is-healthy';
      stat4.textContent = 'High (80%+)';
    } else if (prob >= 0.5) {
      s4.className = 'funnel-step is-healthy';
      stat4.textContent = 'Likely';
    } else if (prob >= 0.25) {
      s4.className = 'funnel-step is-caution';
      stat4.textContent = 'Hesitant';
    } else {
      s4.className = 'funnel-step is-danger';
      stat4.textContent = 'Drop-off';
    }
  }

  /* ═══ 13. DYNAMIC INTERVENTION STRATEGY ENGINE ════════════ */
  function updateInterventionStrategy(prob) {
    if (!interventionText) return;

    if (prob >= 0.75) {
      interventionText.textContent =
        'VIP Conversion Acceleration: High buying certainty detected. Suppress disruptive discount popups to preserve margin; automatically unlock 1-click express checkout and display high-value accessory bundles.';
    } else if (prob >= 0.5) {
      interventionText.textContent =
        'Cart Momentum Reinforcement: Visitor is leaning to buy. Reinforce with subtle urgency signals ("Only 3 left in stock"), highlight free shipping guarantee, and spotlight verified 5-star customer reviews.';
    } else if (prob >= 0.3) {
      interventionText.textContent =
        'Exit-Intent Recovery: Moderate hesitation detected. Trigger a subtle 10% coupon overlay upon cursor exit-intent, or offer instant live-chat concierge assistance for sizing/spec questions.';
    } else {
      interventionText.textContent =
        'Discovery & Re-engagement: Low conversion intent. Keep shopping friction zero: streamline navigation, showcase trending top-rated bestsellers, and prompt for an email newsletter discount.';
    }
  }

  /* ═══ 14. WEIGHTS VIEW SWITCHER (Live SHAP vs Global) ═════ */
  const GLOBAL_WEIGHTS = [
    { label: 'Page Value',         pct: 0.38, color: '#ff6b35' },
    { label: 'Exit Rate',          pct: 0.24, color: '#f43f5e' },
    { label: 'Bounce Rate',        pct: 0.20, color: '#8b5cf6' },
    { label: 'Product Duration',   pct: 0.18, color: '#06b6d4' },
    { label: 'Product Pages',      pct: 0.10, color: '#10b981' },
    { label: 'Admin Duration',     pct: 0.06, color: '#656a8f' },
  ];

  let weightsMode = 'live'; // 'live' or 'global'
  let lastImpacts = [];

  function renderWeights() {
    if (!weightsEl) return;

    if (weightsMode === 'global') {
      const max = Math.max(...GLOBAL_WEIGHTS.map(w => w.pct));
      weightsEl.innerHTML = GLOBAL_WEIGHTS.map(w => {
        const width = (w.pct / max) * 100;
        return `
          <div class="weight-row">
            <span class="weight-row__label">${w.label}</span>
            <div class="weight-row__bar">
              <div class="weight-row__fill" style="width: ${width}%; background: linear-gradient(90deg, ${w.color}, ${w.color}60);"></div>
            </div>
            <span class="weight-row__pct">${Math.round(w.pct * 100)}%</span>
          </div>`;
      }).join('');
    } else {
      // Live SHAP-style session impacts
      const sorted = [...lastImpacts].sort((a, b) => Math.abs(b.contribution) - Math.abs(a.contribution)).slice(0, 6);
      const maxAbs = Math.max(0.1, ...sorted.map(s => Math.abs(s.contribution)));

      weightsEl.innerHTML = sorted.map(item => {
        const isPositive = item.contribution >= 0;
        const color = isPositive ? '#10b981' : '#f43f5e';
        const width = Math.min(100, (Math.abs(item.contribution) / maxAbs) * 100);
        const sign = isPositive ? '+' : '';
        return `
          <div class="weight-row">
            <span class="weight-row__label">${item.label}</span>
            <div class="weight-row__bar">
              <div class="weight-row__fill" style="width: ${width}%; background: linear-gradient(90deg, ${color}, ${color}50);"></div>
            </div>
            <span class="weight-row__pct" style="color: ${color}">${sign}${item.contribution.toFixed(2)}</span>
          </div>`;
      }).join('');
    }
  }

  if (btnWeightLive && btnWeightGlobal) {
    btnWeightLive.addEventListener('click', () => {
      weightsMode = 'live';
      btnWeightLive.classList.add('is-active');
      btnWeightGlobal.classList.remove('is-active');
      renderWeights();
      playTone(500, 'sine', 0.04, 0.03);
    });
    btnWeightGlobal.addEventListener('click', () => {
      weightsMode = 'global';
      btnWeightGlobal.classList.add('is-active');
      btnWeightLive.classList.remove('is-active');
      renderWeights();
      playTone(500, 'sine', 0.04, 0.03);
    });
  }

  /* ═══ 15. BENCHMARK MATRIX VIEW TABS ══════════════════════ */
  const vesselTabs = document.querySelectorAll('[data-vessel-tab]');
  const vesselContents = document.querySelectorAll('.vessel-tab-content');

  vesselTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      vesselTabs.forEach(t => t.classList.remove('is-active'));
      vesselContents.forEach(c => c.classList.remove('is-active'));

      tab.classList.add('is-active');
      const targetId = 'vessel-tab-' + tab.dataset.vesselTab;
      const targetEl = document.getElementById(targetId);
      if (targetEl) targetEl.classList.add('is-active');

      playTone(540, 'sine', 0.05, 0.03);
    });
  });

  /* ═══ 16. EXPORT CONFIGURATION MODAL ══════════════════════ */
  const btnExport = document.getElementById('btn-export');
  const exportModal = document.getElementById('export-modal');
  const btnModalClose = document.getElementById('btn-modal-close');
  const exportJsonCode = document.getElementById('export-json-code');
  const btnCopyJson = document.getElementById('btn-copy-json');
  const btnDownloadJson = document.getElementById('btn-download-json');

  function getExportPayload() {
    const inputs = readInputs();
    const result = predict(inputs);
    return {
      timestamp: new Date().toISOString(),
      model: 'RandomForestClassifier_OnlineShoppers_v2',
      model_accuracy: '89.25%',
      prediction: {
        probability: +(result.prob.toFixed(4)),
        intent_verdict: result.prob >= 0.5 ? 'Purchase' : 'No Purchase',
        confidence_percent: Math.round(result.prob * 100)
      },
      features: inputs
    };
  }

  if (btnExport && exportModal) {
    btnExport.addEventListener('click', () => {
      const payload = getExportPayload();
      if (exportJsonCode) exportJsonCode.textContent = JSON.stringify(payload, null, 2);
      if (typeof exportModal.showModal === 'function') {
        exportModal.showModal();
      } else {
        exportModal.setAttribute('open', '');
      }
      playTone(560, 'sine', 0.06, 0.03);
    });
  }

  if (btnModalClose && exportModal) {
    btnModalClose.addEventListener('click', () => {
      if (typeof exportModal.close === 'function') {
        exportModal.close();
      } else {
        exportModal.removeAttribute('open');
      }
    });
  }

  if (exportModal) {
    exportModal.addEventListener('click', (e) => {
      if (e.target === exportModal) {
        if (typeof exportModal.close === 'function') exportModal.close();
        else exportModal.removeAttribute('open');
      }
    });
  }

  if (btnCopyJson) {
    btnCopyJson.addEventListener('click', () => {
      const payload = getExportPayload();
      navigator.clipboard.writeText(JSON.stringify(payload, null, 2)).then(() => {
        showToast('Session JSON copied to clipboard', 'good');
        playChime(true);
      });
    });
  }

  if (btnDownloadJson) {
    btnDownloadJson.addEventListener('click', () => {
      const payload = getExportPayload();
      const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `shoppers-session-${Date.now()}.json`;
      a.click();
      URL.revokeObjectURL(url);
      showToast('Downloaded session JSON file', 'accent');
      playChime(true);
    });
  }

  /* ═══ 17. SOUND TOGGLE BUTTON ═════════════════════════════ */
  const btnSound = document.getElementById('btn-sound');
  const soundLabel = document.getElementById('sound-label');

  if (btnSound) {
    btnSound.addEventListener('click', () => {
      initAudio();
      soundEnabled = !soundEnabled;
      if (soundEnabled) {
        btnSound.classList.add('is-active');
        if (soundLabel) soundLabel.textContent = 'Sound On';
        playTone(660, 'sine', 0.12, 0.05);
        showToast('Audio feedback enabled', 'good');
      } else {
        btnSound.classList.remove('is-active');
        if (soundLabel) soundLabel.textContent = 'Sound Off';
        showToast('Audio muted', 'normal');
      }
    });
  }

  /* ═══ 18. RESET BUTTON ════════════════════════════════════ */
  const btnReset = document.getElementById('btn-reset');
  if (btnReset) {
    btnReset.addEventListener('click', () => {
      applyPreset({
        administrative: 0,
        'administrative-duration': 0,
        informational: 0,
        'informational-duration': 0,
        'product-related': 1,
        'product-related-duration': 0,
        'bounce-rates': 0.02,
        'exit-rates': 0.04,
        'page-values': 0,
        'special-day': 0.0,
        month: 'Jun',
        'visitor-type': 'Returning_Visitor',
        os: 2, browser: 2, region: 1, 'traffic-type': 2, weekend: false
      });
      showToast('Simulation reset to baseline defaults', 'accent');
      playTone(400, 'sine', 0.1, 0.04);
    });
  }

  /* ═══ 19. GAUGE ANIMATION & VERDICT UPDATE ════════════════ */
  let displayedPct = 0;

  function lerp(a, b, t) { return a + (b - a) * t; }

  function probToAccent(p) {
    if (p < 0.35) return '#ef4444';
    if (p < 0.50) return '#ff6b35';
    if (p < 0.70) return '#f59e0b';
    return '#10b981';
  }

  function animateNumber(el, target) {
    const start = displayedPct;
    const dur = 600;
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

  function updateVerdictUI(p, impacts, inputs) {
    const pct = Math.round(p * 100);
    const offset = DIAL_CIRC * (1 - p);
    lastImpacts = impacts;

    if (dialFill) {
      dialFill.setAttribute('stroke-dashoffset', offset);
      if (p >= 0.5) {
        dialFill.style.stroke = 'url(#dialGradBuy)';
      } else {
        dialFill.style.stroke = 'url(#dialGrad)';
      }
    }

    if (dialGlow) {
      dialGlow.setAttribute('stroke-dashoffset', offset);
      const accent = probToAccent(p);
      dialGlow.setAttribute('stroke', accent);
      dialGlow.style.opacity = 0.15 + p * 0.35;
    }

    if (verdictNum) animateNumber(verdictNum, pct);

    // Verdict call status banner
    if (p >= 0.5) {
      verdictCall.className = 'verdict__call is-purchase';
      verdictIcon.textContent = '✓';
      verdictText.textContent = 'Will purchase';
      if (verdictSubBadge) {
        verdictSubBadge.textContent = p >= 0.75 ? 'High Conviction' : 'Favorable Probability';
      }
    } else {
      verdictCall.className = 'verdict__call is-no';
      verdictIcon.textContent = '×';
      verdictText.textContent = 'Won\'t purchase';
      if (verdictSubBadge) {
        verdictSubBadge.textContent = p <= 0.2 ? 'High Drop-off Risk' : 'Hesitation Detected';
      }
    }

    // Confidence meter
    if (confidPct && confidFill) {
      const conf = Math.round(p * 100);
      confidPct.textContent = conf + '%';
      confidFill.style.width = conf + '%';
      const accent = probToAccent(p);
      confidFill.style.background = `linear-gradient(90deg, ${accent}, ${probToAccent(Math.min(1, p + 0.15))})`;
    }

    // Drivers list (SHAP top 3)
    if (whyList) {
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

    // Update new rich components
    updateWhatIfCatalyst(p, inputs);
    updateFunnelHealth(inputs, p);
    updateInterventionStrategy(p);
    renderWeights();
  }

  /* ═══ 20. INPUT CHANGE PIPELINE ═══════════════════════════ */
  function onChange() {
    paintSliderValues();
    const inputs = readInputs();
    const { prob, impacts } = predict(inputs);
    updateVerdictUI(prob, impacts, inputs);
  }

  for (const el of Object.values(sliders)) {
    el.addEventListener('input', () => {
      paintSliderValues();
      onChange();
    });
  }

  for (const el of Object.values(selects)) {
    el.addEventListener('change', () => {
      playTone(460, 'sine', 0.04, 0.03);
      onChange();
    });
  }

  weekendCheckbox.addEventListener('change', () => {
    playTone(490, 'sine', 0.04, 0.03);
    onChange();
  });

  /* ═══ 21. INIT ════════════════════════════════════════════ */
  paintSliderValues();
  onChange();

})();
