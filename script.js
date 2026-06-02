/* ════════════════════════════════════════════
   BIRTHDAY WEBSITE — script.js  (Enhanced)
   Teena's Birthday Surprise — June 4, 2026
════════════════════════════════════════════ */

/* ─────────────────────────────────────────
   0. LOADING SCREEN
───────────────────────────────────────── */
window.addEventListener('load', () => {
  const loader = document.getElementById('loaderScreen');
  // Wait for fill animation (~1.8s) then fade out
  setTimeout(() => {
    if (loader) loader.classList.add('fade-out');
    // Start scroll-reveal observer after loader gone
    setTimeout(initScrollReveal, 500);
  }, 2000);
});

/* ─────────────────────────────────────────
   1. BACKGROUND MUSIC — synth + mp3 fallback
───────────────────────────────────────── */
const musicBtn = document.getElementById('musicBtn');
const bgMusic  = document.getElementById('bgMusic');
let musicPlaying = false;
let activeCtx    = null;
let loopTimer    = null;

// Note frequencies
const _C4=261.63,_D4=293.66,_E4=329.63,_F4=349.23,
      _G4=392,_A4=440,_Bb4=466.16,_C5=523.25,
      _F3=174.61,_A3=220,_C3=130.81,_G3=196,
      _Bb3=233.08,_D3=146.83,_E3=164.81;
const TEMPO = 0.40;
const MELODY = [
  [_C4,.75,[_F3,_C3]],[_C4,.25,[_F3,_C3]],
  [_D4,1,  [_F3,_C3]],[_C4,1,  [_F3,_A3]],
  [_F4,1,  [_F3,_C4]],[_E4,2,  [_E3,_C4]],
  [_C4,.75,[_C3,_G3]],[_C4,.25,[_C3,_G3]],
  [_D4,1,  [_C3,_G3]],[_C4,1,  [_C3]],
  [_G4,1,  [_G3,_D3]],[_F4,2,  [_F3,_C3]],
  [_C4,.75,[_C3,_G3]],[_C4,.25,[_C3,_G3]],
  [_C5,1,  [_C3,_G3]],[_A4,1,  [_A3]],
  [_F4,1,  [_F3,_C4]],[_E4,1,  [_E3,_C4]],[_D4,1,[_D3,_A3]],
  [_Bb4,.75,[_Bb3,_F3]],[_Bb4,.25,[_Bb3,_F3]],
  [_A4,1,[_A3,_F3]],[_F4,1,[_F3,_C4]],[_G4,1,[_G3]],[_F4,2,[_F3,_C3]]
];

function playNoteOn(ctx, dest, freq, t0, t1, vol, type) {
  if (!freq) return;
  const osc = ctx.createOscillator();
  const env = ctx.createGain();
  osc.connect(env); env.connect(dest);
  osc.type = type || 'triangle';
  osc.frequency.setValueAtTime(freq, t0);
  env.gain.setValueAtTime(0, t0);
  env.gain.linearRampToValueAtTime(vol, t0 + 0.04);
  env.gain.setValueAtTime(vol * .82, t1 - 0.06);
  env.gain.linearRampToValueAtTime(0, t1);
  osc.start(t0); osc.stop(t1 + 0.01);
}

function runLoop(ctx) {
  if (!musicPlaying || ctx.state === 'closed') return;
  let t = ctx.currentTime + 0.08;
  MELODY.forEach(([mel, dur, chords]) => {
    const end = t + dur * TEMPO;
    playNoteOn(ctx, ctx.destination, mel,   t, end, 0.28, 'triangle');
    playNoteOn(ctx, ctx.destination, mel/2, t, end, 0.09, 'sine');
    if (Array.isArray(chords)) chords.forEach(cf => playNoteOn(ctx, ctx.destination, cf, t, end, 0.07, 'sine'));
    else if (chords) playNoteOn(ctx, ctx.destination, chords, t, end, 0.07, 'sine');
    t = end;
  });
  const ms = MELODY.reduce((s,[,d]) => s + d * TEMPO, 0) * 1000 + 400;
  loopTimer = setTimeout(() => runLoop(ctx), ms);
}

function startSynth() {
  activeCtx = new (window.AudioContext || window.webkitAudioContext)();
  runLoop(activeCtx);
}

function startMusic() {
  musicPlaying = true;
  musicBtn.textContent = '⏹ Stop Music';
  // Try real MP3 first
  if (bgMusic && bgMusic.src) {
    bgMusic.currentTime = 0;
    bgMusic.play().then(() => {
      // mp3 playing fine
    }).catch(() => startSynth());
  } else {
    startSynth();
  }
}

function stopMusic() {
  musicPlaying = false;
  if (loopTimer) { clearTimeout(loopTimer); loopTimer = null; }
  if (activeCtx && activeCtx.state !== 'closed') {
    activeCtx.close().catch(() => {});
    activeCtx = null;
  }
  if (bgMusic && !bgMusic.paused) {
    bgMusic.pause();
    bgMusic.currentTime = 0;
  }
  musicBtn.textContent = '🎵 Play Music';
}

musicBtn.addEventListener('click', e => {
  e.stopPropagation();
  musicPlaying ? stopMusic() : startMusic();
});

/* ─────────────────────────────────────────
   2. CONFETTI (hero section)
───────────────────────────────────────── */
(function spawnConfetti() {
  const wrap   = document.getElementById('confettiWrap');
  const colors = ['#f472b6','#c084fc','#a855f7','#f9a8d4','#818cf8','#fde68a','#6ee7b7'];
  for (let i = 0; i < 60; i++) {
    const p = document.createElement('div');
    p.className = 'confetti-piece';
    p.style.cssText = `
      left: ${Math.random() * 100}%;
      background: ${colors[Math.floor(Math.random() * colors.length)]};
      width: ${6 + Math.random() * 8}px;
      height: ${10 + Math.random() * 10}px;
      border-radius: ${Math.random() > .5 ? '50%' : '2px'};
      animation-duration: ${3 + Math.random() * 5}s;
      animation-delay: ${Math.random() * 5}s;
    `;
    wrap.appendChild(p);
  }
})();

/* ─────────────────────────────────────────
   3. FLOATING HEARTS
───────────────────────────────────────── */
(function spawnHearts() {
  const container = document.getElementById('heartsContainer');
  // Heart symbols with soft colours via CSS filter
  const heartSymbols = ['♥', '❤', '💕', '💗', '💖', '💓'];

  function createHeart() {
    const h = document.createElement('span');
    h.className = 'heart-particle';
    const size    = 10 + Math.random() * 22;      // px font-size
    const opacity = 0.18 + Math.random() * 0.45;
    const dur     = 10 + Math.random() * 14;      // seconds
    const delay   = Math.random() * 8;
    const left    = Math.random() * 100;
    const symbol  = heartSymbols[Math.floor(Math.random() * heartSymbols.length)];
    // Colour range: pinks, reds, white, lavender
    const hues    = ['#f9a8d4','#f472b6','#fb7185','#fecdd3','#e879f9','#fff'];
    const color   = hues[Math.floor(Math.random() * hues.length)];

    h.textContent = symbol;
    h.style.cssText = `
      left: ${left}%;
      font-size: ${size}px;
      color: ${color};
      opacity: ${opacity};
      animation-duration: ${dur}s;
      animation-delay: ${delay}s;
      text-shadow: 0 0 ${4 + Math.random() * 6}px ${color};
      filter: blur(${Math.random() > .6 ? '0.8px' : '0px'});
    `;
    container.appendChild(h);

    // Recycle after animation ends
    const total = (dur + delay) * 1000 + 500;
    setTimeout(() => h.remove(), total);
  }

  // Initial batch
  for (let i = 0; i < 18; i++) createHeart();
  // Continuous spawn
  setInterval(createHeart, 1200);
})();

/* ─────────────────────────────────────────
   4. FLOATING BALLOONS
───────────────────────────────────────── */
(function spawnBalloons() {
  const container = document.getElementById('balloonsContainer');
  const colors    = [
    '#f472b6','#c084fc','#a855f7','#f9a8d4',
    '#818cf8','#fb7185','#e879f9','#6366f1',
    '#fde68a','#6ee7b7','#38bdf8','#f97316'
  ];

  function createBalloon() {
    const b     = document.createElement('div');
    b.className = 'balloon';
    const color = colors[Math.floor(Math.random() * colors.length)];
    // Add shine div
    const shine = document.createElement('div');
    shine.className = 'balloon-shine';
    b.appendChild(shine);
    b.style.cssText = `
      left: ${Math.random() * 100}%;
      background: radial-gradient(circle at 35% 30%, ${color}ee, ${color}88);
      width: ${42 + Math.random() * 28}px;
      height: ${56 + Math.random() * 34}px;
      animation-duration: ${7 + Math.random() * 10}s;
      animation-delay: ${Math.random() * 6}s;
    `;
    container.appendChild(b);
    const dur = parseFloat(b.style.animationDuration) * 1000
              + parseFloat(b.style.animationDelay)    * 1000 + 500;
    setTimeout(() => b.remove(), dur);
  }

  for (let i = 0; i < 20; i++) createBalloon();
  setInterval(createBalloon, 1400);
})();

/* ─────────────────────────────────────────
   5. COUNTDOWN TIMER
───────────────────────────────────────── */
(function initCountdown() {
  const BIRTH_MONTH = 5; // June (0-indexed)
  const BIRTH_DAY   = 4;
  const BIRTH_YEAR  = 2026;

  function getTargetBirthday() {
    const specific = new Date(BIRTH_YEAR, BIRTH_MONTH, BIRTH_DAY, 0, 0, 0, 0);
    const now      = new Date();
    if (specific > now) return specific;
    return new Date(now.getFullYear() + 1, BIRTH_MONTH, BIRTH_DAY, 0, 0, 0, 0);
  }

  function pad(n) { return String(n).padStart(2, '0'); }

  function tick() {
    const now  = new Date();
    const next = getTargetBirthday();
    const diff = next - now;
    const msgEl = document.getElementById('countdownMsg');

    if (now.getMonth() === BIRTH_MONTH && now.getDate() === BIRTH_DAY) {
      msgEl.textContent = "🎉 Today is Teena's Birthday! 🎉";
      ['days','hours','minutes','seconds'].forEach(id => {
        document.getElementById(id).textContent = '00';
      });
      return;
    }

    const isThisYear = (next.getFullYear() === BIRTH_YEAR);
    msgEl.textContent = isThisYear
      ? "🎀 Teena's Birthday is on June 4, 2026 🎀"
      : 'Next Birthday In:';

    const d = Math.floor(diff / 86400000);
    const h = Math.floor((diff % 86400000) / 3600000);
    const m = Math.floor((diff % 3600000)  / 60000);
    const s = Math.floor((diff % 60000)    / 1000);

    document.getElementById('days').textContent    = pad(d);
    document.getElementById('hours').textContent   = pad(h);
    document.getElementById('minutes').textContent = pad(m);
    document.getElementById('seconds').textContent = pad(s);
  }

  tick();
  setInterval(tick, 1000);
})();

/* ─────────────────────────────────────────
   6. BIRTHDAY CAKE — BLOW OUT CANDLES
───────────────────────────────────────── */
(function initCake() {
  const blowBtn = document.getElementById('blowBtn');
  const wishMsg = document.getElementById('wishMsg');
  const flames  = document.querySelectorAll('.flame');
  let blown     = false;

  blowBtn.addEventListener('click', () => {
    if (blown) {
      flames.forEach(f => f.classList.remove('off'));
      blowBtn.textContent = '🌬️ Blow Out the Candles!';
      wishMsg.textContent = '';
      blown = false;
    } else {
      flames.forEach((f, i) => {
        setTimeout(() => f.classList.add('off'), i * 180);
      });
      setTimeout(() => {
        wishMsg.textContent = '🌟 Make a wish, Teena! Your dream is coming true! 🌟';
        blowBtn.textContent = '🕯️ Relight Candles';
        triggerCelebration();
      }, flames.length * 180 + 200);
      blown = true;
    }
  });
})();

/* ─────────────────────────────────────────
   7. PREMIUM PHOTO CAROUSEL
───────────────────────────────────────── */
(function initCarousel() {
  const track   = document.getElementById('carouselTrack');
  const prevBtn = document.getElementById('carouselPrev');
  const nextBtn = document.getElementById('carouselNext');
  const dots    = document.querySelectorAll('.carousel-dot');
  const cards   = document.querySelectorAll('.carousel-card');
  const total   = cards.length;

  let current      = 0;
  let autoTimer    = null;
  let touchStartX  = 0;
  let touchEndX    = 0;
  let isDragging   = false;
  let dragStartX   = 0;

  // Build a cloned infinite set: [last, ...originals, first]
  // Instead, simpler approach: use transform offset per card width
  function getCardWidth() {
    if (!cards[0]) return 0;
    const style = getComputedStyle(track);
    const gap   = parseInt(style.gap) || 20;
    return cards[0].offsetWidth + gap;
  }

  function goTo(index, animate = true) {
    // Clamp
    current = ((index % total) + total) % total;
    const offset = current * getCardWidth();

    track.style.transition = animate
      ? 'transform .55s cubic-bezier(.25,.46,.45,.94)'
      : 'none';
    track.style.transform  = `translateX(-${offset}px)`;

    // Update active state
    cards.forEach((c, i) => {
      c.classList.toggle('is-active', i === current);
    });
    // Update dots
    dots.forEach((d, i) => {
      d.classList.toggle('active', i === current);
    });
  }

  function startAuto() {
    clearInterval(autoTimer);
    autoTimer = setInterval(() => goTo(current + 1), 3800);
  }

  function resetAuto() {
    startAuto();
  }

  // Arrows
  nextBtn.addEventListener('click', () => { goTo(current + 1); resetAuto(); });
  prevBtn.addEventListener('click', () => { goTo(current - 1); resetAuto(); });

  // Dots
  dots.forEach(dot => {
    dot.addEventListener('click', () => {
      goTo(parseInt(dot.dataset.index));
      resetAuto();
    });
  });

  // Touch swipe
  const wrap = document.querySelector('.carousel-track-wrap');
  wrap.addEventListener('touchstart', e => {
    touchStartX = e.changedTouches[0].clientX;
  }, { passive: true });
  wrap.addEventListener('touchend', e => {
    touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartX - touchEndX;
    if (Math.abs(diff) > 40) {
      diff > 0 ? goTo(current + 1) : goTo(current - 1);
      resetAuto();
    }
  }, { passive: true });

  // Mouse drag
  wrap.addEventListener('mousedown', e => {
    isDragging = true;
    dragStartX = e.clientX;
    track.style.transition = 'none';
  });
  window.addEventListener('mouseup', e => {
    if (!isDragging) return;
    isDragging = false;
    const diff = dragStartX - e.clientX;
    if (Math.abs(diff) > 40) {
      diff > 0 ? goTo(current + 1) : goTo(current - 1);
    } else {
      goTo(current); // snap back
    }
    resetAuto();
  });

  // Init
  goTo(0, false);
  startAuto();

  // Pause on hover
  wrap.addEventListener('mouseenter', () => clearInterval(autoTimer));
  wrap.addEventListener('mouseleave', () => startAuto());
})();

/* ─────────────────────────────────────────
   8. FIREWORKS
───────────────────────────────────────── */
const canvas = document.getElementById('fireworksCanvas');
const ctx    = canvas.getContext('2d');

function resizeCanvas() {
  canvas.width  = window.innerWidth;
  canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

const particles = [];

function randomColor() {
  const cols = [
    '#f472b6','#c084fc','#a855f7','#f9a8d4',
    '#818cf8','#fde68a','#fb7185','#6ee7b7','#fff'
  ];
  return cols[Math.floor(Math.random() * cols.length)];
}

class Particle {
  constructor(x, y) {
    this.x = x; this.y = y;
    const angle = Math.random() * Math.PI * 2;
    const speed = 2 + Math.random() * 6;
    this.vx      = Math.cos(angle) * speed;
    this.vy      = Math.sin(angle) * speed;
    this.alpha   = 1;
    this.decay   = .012 + Math.random() * .016;
    this.radius  = 2 + Math.random() * 3;
    this.color   = randomColor();
    this.gravity = .08;
    this.trail   = [];
  }
  update() {
    this.trail.push({ x: this.x, y: this.y });
    if (this.trail.length > 6) this.trail.shift();
    this.vx  *= .98;
    this.vy   = this.vy * .98 + this.gravity;
    this.x   += this.vx;
    this.y   += this.vy;
    this.alpha -= this.decay;
  }
  draw() {
    ctx.save();
    for (let i = 0; i < this.trail.length; i++) {
      const t = this.trail[i];
      ctx.globalAlpha = (i / this.trail.length) * this.alpha * .4;
      ctx.beginPath();
      ctx.arc(t.x, t.y, this.radius * .6, 0, Math.PI * 2);
      ctx.fillStyle = this.color;
      ctx.fill();
    }
    ctx.globalAlpha   = this.alpha;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fillStyle     = this.color;
    ctx.shadowBlur    = 8;
    ctx.shadowColor   = this.color;
    ctx.fill();
    ctx.restore();
  }
}

function launchFirework(x, y) {
  const count = 80 + Math.floor(Math.random() * 60);
  for (let i = 0; i < count; i++) particles.push(new Particle(x, y));
}

function fireworkLoop() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  for (let i = particles.length - 1; i >= 0; i--) {
    particles[i].update();
    particles[i].draw();
    if (particles[i].alpha <= 0) particles.splice(i, 1);
  }
  requestAnimationFrame(fireworkLoop);
}
fireworkLoop();

// Auto fireworks
setInterval(() => {
  launchFirework(
    canvas.width  * (.2 + Math.random() * .6),
    canvas.height * (.1 + Math.random() * .5)
  );
}, 2200);

// Click to launch
document.addEventListener('click', e => {
  if (e.target.closest('button, a, .carousel-card, .lightbox, .music-btn, .surprise-overlay')) return;
  launchFirework(e.clientX, e.clientY);
});

/* ─────────────────────────────────────────
   9. CELEBRATION BURST (candles blown)
───────────────────────────────────────── */
function triggerCelebration() {
  for (let i = 0; i < 5; i++) {
    setTimeout(() => {
      launchFirework(
        canvas.width  * (.15 + Math.random() * .7),
        canvas.height * (.1  + Math.random() * .5)
      );
    }, i * 250);
  }
}

/* ─────────────────────────────────────────
   10. SCROLL REVEAL (blur-to-clear)
───────────────────────────────────────── */
function initScrollReveal() {
  const sections = document.querySelectorAll('.reveal-section');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });
  sections.forEach(sec => observer.observe(sec));
}

/* ─────────────────────────────────────────
   11. LETTER TYPING ANIMATION
───────────────────────────────────────── */
(function initLetter() {
  const letterText = `I don't know if this small surprise can fully express how special you are, but I wanted to create something meaningful just for you.\n\nThank you for the smiles, memories, and moments that make life brighter.\n\nI genuinely hope this birthday brings happiness, peace, success, and everything your heart wishes for.\n\nStay amazing always ✨\nHappy Birthday.`;

  const bodyEl   = document.getElementById('letterBody');
  const sigText  = document.getElementById('sigText');
  const section  = document.getElementById('letter');

  let started = false;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !started) {
        started = true;
        observer.unobserve(entry.target);
        startTyping();
      }
    });
  }, { threshold: 0.25 });

  observer.observe(section);

  function startTyping() {
    let i = 0;
    bodyEl.textContent = '';

    // Spawn letter sparkles
    spawnLetterSparkles();

    const typeInterval = setInterval(() => {
      if (i < letterText.length) {
        bodyEl.textContent += letterText[i];
        i++;
        // Auto-scroll inside section if needed
        bodyEl.scrollTop = bodyEl.scrollHeight;
      } else {
        clearInterval(typeInterval);
        bodyEl.classList.add('typing-done');
        // Reveal signature
        sigText.textContent = 'With love always 💜';
        sigText.classList.add('revealed');
        document.querySelector('.sig-line').classList.add('revealed');
      }
    }, 28); // ms per character
  }
})();

/* ─────────────────────────────────────────
   12. LETTER SPARKLES
───────────────────────────────────────── */
function spawnLetterSparkles() {
  const wrap = document.getElementById('letterSparkles');
  if (!wrap) return;
  for (let i = 0; i < 16; i++) {
    const s = document.createElement('div');
    s.className = 'letter-sparkle';
    s.style.cssText = `
      left: ${Math.random() * 100}%;
      top:  ${Math.random() * 100}%;
      width:  ${4 + Math.random() * 5}px;
      height: ${4 + Math.random() * 5}px;
      animation-duration: ${2 + Math.random() * 3}s;
      animation-delay:    ${Math.random() * 2}s;
    `;
    wrap.appendChild(s);
    setTimeout(() => s.remove(), 6000);
  }
  // Keep spawning while letter visible
  setInterval(() => {
    if (!wrap.isConnected) return;
    for (let i = 0; i < 3; i++) {
      const s = document.createElement('div');
      s.className = 'letter-sparkle';
      s.style.cssText = `
        left: ${Math.random() * 100}%;
        top:  ${Math.random() * 100}%;
        width:  ${4 + Math.random() * 6}px;
        height: ${4 + Math.random() * 6}px;
        animation-duration: ${2 + Math.random() * 3}s;
        animation-delay: 0s;
      `;
      wrap.appendChild(s);
      setTimeout(() => s.remove(), 5500);
    }
  }, 1200);
}

/* ─────────────────────────────────────────
   13. MIDNIGHT SURPRISE POPUP (June 4)
───────────────────────────────────────── */
(function initMidnightSurprise() {
  const overlay     = document.getElementById('surpriseOverlay');
  const surpriseBtn = document.getElementById('surpriseBtn');
  const BDAY_MONTH  = 5; // June
  const BDAY_DAY    = 4;

  function checkBirthday() {
    const now = new Date();
    if (now.getMonth() === BDAY_MONTH && now.getDate() === BDAY_DAY) {
      showSurprise();
    }
  }

  function showSurprise() {
    overlay.classList.remove('hidden');
    overlay.classList.add('visible');
    spawnSurpriseConfetti();
    // Burst fireworks
    setTimeout(() => {
      for (let i = 0; i < 6; i++) {
        setTimeout(() => {
          launchFirework(
            canvas.width  * (.15 + Math.random() * .7),
            canvas.height * (.1  + Math.random() * .6)
          );
        }, i * 300);
      }
    }, 600);
  }

  function hideSurprise() {
    overlay.classList.remove('visible');
    setTimeout(() => overlay.classList.add('hidden'), 600);
    // Trigger extra fireworks
    triggerCelebration();
    triggerCelebration();
  }

  surpriseBtn.addEventListener('click', hideSurprise);
  overlay.addEventListener('click', e => {
    if (e.target === overlay) hideSurprise();
  });

  // Check now, then every 30s
  checkBirthday();
  setInterval(checkBirthday, 30000);
})();

/* ─────────────────────────────────────────
   14. SURPRISE POPUP CONFETTI
───────────────────────────────────────── */
function spawnSurpriseConfetti() {
  const wrap   = document.getElementById('surpriseConfetti');
  const colors = ['#f472b6','#c084fc','#fde68a','#fff','#6ee7b7','#f9a8d4'];
  for (let i = 0; i < 40; i++) {
    const p = document.createElement('div');
    p.className = 'confetti-piece';
    p.style.cssText = `
      left: ${Math.random() * 100}%;
      background: ${colors[Math.floor(Math.random() * colors.length)]};
      width: ${5 + Math.random() * 7}px;
      height: ${8 + Math.random() * 10}px;
      border-radius: ${Math.random() > .5 ? '50%' : '2px'};
      animation-duration: ${2 + Math.random() * 4}s;
      animation-delay: ${Math.random() * 2}s;
    `;
    wrap.appendChild(p);
  }
}

/* ─────────────────────────────────────────
   15. GALLERY LIGHTBOX
───────────────────────────────────────── */
(function initGallery() {
  const lightbox = document.getElementById('lightbox');
  const lbBody   = document.getElementById('lbBody');
  const lbCap    = document.getElementById('lbCaption');
  const lbClose  = document.getElementById('lbClose');

  if (!lightbox) return;

  document.querySelectorAll('.gallery-card').forEach(card => {
    card.addEventListener('click', () => {
      const img = card.querySelector('img');
      if (!img) return;
      const clone = img.cloneNode();
      clone.style.cssText = 'width:100%;display:block;max-height:72vh;object-fit:cover;';
      lbBody.innerHTML = '';
      lbBody.appendChild(clone);
      lbCap.textContent = card.dataset.caption || '';
      lightbox.classList.remove('hidden');
      document.body.style.overflow = 'hidden';
    });
  });

  const close = () => {
    lightbox.classList.add('hidden');
    document.body.style.overflow = '';
  };

  lbClose.addEventListener('click', close);
  lightbox.addEventListener('click', e => {
    if (e.target === lightbox || e.target.classList.contains('lb-backdrop')) close();
  });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') close(); });
})();

/* ─────────────────────────────────────────
   16. GLITTER PARTICLES (canvas-based)
───────────────────────────────────────── */
(function initGlitter() {
  const gc  = document.getElementById('glitterCanvas');
  if (!gc) return;
  const gx  = gc.getContext('2d');

  function resizeGlitter() {
    gc.width  = window.innerWidth;
    gc.height = window.innerHeight;
  }
  resizeGlitter();
  window.addEventListener('resize', resizeGlitter);

  const GLITTER_COLORS = [
    'rgba(244,114,182,', 'rgba(192,132,252,',
    'rgba(253,230,138,', 'rgba(255,255,255,',
    'rgba(167,139,250,', 'rgba(249,168,212,'
  ];

  const glitters = [];
  const GLITTER_COUNT = 120;

  class Glitter {
    constructor() { this.reset(true); }
    reset(initial) {
      this.x     = Math.random() * gc.width;
      this.y     = initial ? Math.random() * gc.height : -10;
      this.size  = 1 + Math.random() * 3.5;
      this.speed = .4 + Math.random() * 1.2;
      this.drift = (Math.random() - .5) * .6;
      this.alpha = 0;
      this.targetAlpha = .3 + Math.random() * .7;
      this.color = GLITTER_COLORS[Math.floor(Math.random() * GLITTER_COLORS.length)];
      this.spin  = Math.random() * Math.PI * 2;
      this.spinSpeed = (Math.random() - .5) * .12;
      this.twinkleSpeed = .02 + Math.random() * .04;
      this.twinkleOffset = Math.random() * Math.PI * 2;
      this.tick  = 0;
    }
    update() {
      this.tick++;
      this.y    += this.speed;
      this.x    += this.drift;
      this.spin += this.spinSpeed;
      // Twinkle
      this.alpha = this.targetAlpha * (.5 + .5 * Math.sin(this.tick * this.twinkleSpeed + this.twinkleOffset));
      if (this.y > gc.height + 10) this.reset(false);
    }
    draw() {
      gx.save();
      gx.translate(this.x, this.y);
      gx.rotate(this.spin);
      gx.globalAlpha = this.alpha;
      // Diamond shape
      gx.beginPath();
      gx.moveTo(0, -this.size);
      gx.lineTo(this.size * .5, 0);
      gx.lineTo(0,  this.size);
      gx.lineTo(-this.size * .5, 0);
      gx.closePath();
      gx.fillStyle = this.color + this.alpha + ')';
      gx.shadowBlur  = 6;
      gx.shadowColor = this.color + '0.8)';
      gx.fill();
      gx.restore();
    }
  }

  for (let i = 0; i < GLITTER_COUNT; i++) glitters.push(new Glitter());

  function glitterLoop() {
    gx.clearRect(0, 0, gc.width, gc.height);
    glitters.forEach(g => { g.update(); g.draw(); });
    requestAnimationFrame(glitterLoop);
  }
  glitterLoop();
})();

/* ─────────────────────────────────────────
   17. PAGE-LOAD FIREWORKS BURST
───────────────────────────────────────── */
window.addEventListener('load', () => {
  // Burst 8 fireworks across the screen after 2.2s (after loader)
  setTimeout(() => {
    const positions = [
      [.15,.25],[.3,.2],[.5,.15],[.7,.2],[.85,.25],
      [.2,.45],[.5,.35],[.8,.45]
    ];
    positions.forEach(([xr, yr], i) => {
      setTimeout(() => {
        launchFirework(
          canvas.width  * xr,
          canvas.height * yr
        );
      }, i * 180);
    });
  }, 2200);
});
