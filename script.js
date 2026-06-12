/* ═══════════════════════════════════════════════
   script.js — Animações e interações
═══════════════════════════════════════════════ */

// ─── 1. TEIA ANIMADA NO CANVAS ─────────────────
// Estilo: nós com linhas que formam teia real,
// com "ancoragens" nos cantos como teia de aranha
const canvas = document.getElementById('webCanvas');
const ctx    = canvas.getContext('2d');

let nodes = [];
const NODE_COUNT = 42;

function resizeCanvas() {
  canvas.width  = window.innerWidth;
  canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener('resize', () => { resizeCanvas(); buildNodes(); });

function buildNodes() {
  nodes = [];
  // Nós normais que flutuam
  for (let i = 0; i < NODE_COUNT; i++) {
    nodes.push({
      x:  Math.random() * canvas.width,
      y:  Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.35,
      vy: (Math.random() - 0.5) * 0.35,
      anchor: false,
    });
  }
  // Âncoras fixas nos cantos (simulam teia presa na parede)
  const anchors = [
    { x: 0, y: 0 }, { x: canvas.width, y: 0 },
    { x: 0, y: canvas.height }, { x: canvas.width, y: canvas.height },
    { x: canvas.width / 2, y: 0 }, { x: 0, y: canvas.height / 2 },
    { x: canvas.width, y: canvas.height / 2 },
  ];
  anchors.forEach(a => nodes.push({ ...a, vx: 0, vy: 0, anchor: true }));
}
buildNodes();

function drawWeb() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Move nós livres
  nodes.forEach(n => {
    if (n.anchor) return;
    n.x += n.vx;
    n.y += n.vy;
    if (n.x < 0 || n.x > canvas.width)  n.vx *= -1;
    if (n.y < 0 || n.y > canvas.height) n.vy *= -1;
  });

  // Conecta nós próximos com gradiente vermelho→azul
  const MAX_DIST = 190;
  for (let i = 0; i < nodes.length; i++) {
    for (let j = i + 1; j < nodes.length; j++) {
      const dx   = nodes[i].x - nodes[j].x;
      const dy   = nodes[i].y - nodes[j].y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < MAX_DIST) {
        const alpha = (1 - dist / MAX_DIST) * 0.65;
        const grad  = ctx.createLinearGradient(nodes[i].x, nodes[i].y, nodes[j].x, nodes[j].y);
        grad.addColorStop(0, `rgba(192, 30, 50, ${alpha})`);
        grad.addColorStop(1, `rgba(40, 80, 200, ${alpha * 0.7})`);

        ctx.beginPath();
        ctx.moveTo(nodes[i].x, nodes[i].y);
        ctx.lineTo(nodes[j].x, nodes[j].y);
        ctx.strokeStyle = grad;
        ctx.lineWidth   = nodes[i].anchor || nodes[j].anchor ? 1.0 : 0.7;
        ctx.stroke();
      }
    }
  }

  // Pontos nos nós
  nodes.forEach(n => {
    ctx.beginPath();
    ctx.arc(n.x, n.y, n.anchor ? 2.5 : 1.8, 0, Math.PI * 2);
    ctx.fillStyle = n.anchor
      ? 'rgba(192, 21, 42, 0.8)'
      : 'rgba(180, 50, 70, 0.55)';
    ctx.fill();
  });

  requestAnimationFrame(drawWeb);
}
drawWeb();


// ─── 2. CORAÇÕES + TEIAS FLUTUANTES ────────────
// Mix de corações e símbolos temáticos do Spider-Man
const heartsContainer = document.getElementById('heartsContainer');
const FLOAT_CHARS = ['❤️', '🩷', '💕', '🕷️', '✨', '💗', '🕸️'];

function spawnFloating() {
  const el = document.createElement('div');
  el.classList.add('heart');
  el.textContent = FLOAT_CHARS[Math.floor(Math.random() * FLOAT_CHARS.length)];

  const left     = Math.random() * 97;
  const duration = 7 + Math.random() * 8;
  const size     = 0.75 + Math.random() * 0.85;

  el.style.cssText = `
    left: ${left}%;
    font-size: ${size}rem;
    animation-duration: ${duration}s;
    animation-delay: 0s;
  `;

  heartsContainer.appendChild(el);
  setTimeout(() => el.remove(), duration * 1000);
}

setInterval(spawnFloating, 2800);
for (let i = 0; i < 5; i++) setTimeout(spawnFloating, i * 500);


// ─── 3. CONTROLE DE MÚSICA + OVERLAY DE ENTRADA ───
const music      = document.getElementById('bg-music');
const musicBtn   = document.getElementById('musicBtn');
const overlay    = document.getElementById('entry-overlay');
const entryBtn   = document.getElementById('entryBtn');
let musicStarted = false;

// Bloqueia o scroll enquanto o overlay estiver visível
document.body.style.overflow = 'hidden';

entryBtn.addEventListener('click', () => {
  music.volume = 0.4;
  music.play()
    .then(() => {
      musicBtn.classList.add('playing');
      musicStarted = true;
    })
    .catch(err => console.warn('Erro ao tocar:', err));

  // Fade out no overlay e libera o scroll
  overlay.classList.add('hide');
  setTimeout(() => {
    overlay.remove();
    document.body.style.overflow = '';
  }, 800);
});

// Botão flutuante de música (pausar/retomar)
musicBtn.addEventListener('click', () => {
  if (music.paused) {
    music.play().then(() => {
      musicBtn.classList.add('playing');
      musicBtn.title = 'Pausar música';
    });
  } else {
    music.pause();
    musicBtn.classList.remove('playing');
    musicBtn.title = 'Tocar música';
  }
});

// ─── 4. REVEAL AO ROLAR ───────────────────────
function addReveal() {
  const targets = document.querySelectorAll(
    '.image-section, .message-section, .letter-section, .gallery-section, .timeline-item, .universe-badge'
  );
  targets.forEach(el => el.classList.add('reveal'));

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) entry.target.classList.add('visible');
    });
  }, { threshold: 0.1 });

  targets.forEach(el => observer.observe(el));
}
addReveal();


// ─── 5. PARALLAX NO HERO ──────────────────────
const heroContent  = document.querySelector('.hero-content');
const spiderEmblem = document.querySelector('.spider-emblem');

window.addEventListener('scroll', () => {
  const scrollY = window.scrollY;
  const vh      = window.innerHeight;
  if (scrollY >= vh) return;

  if (heroContent) {
    heroContent.style.transform = `translateY(${scrollY * 0.28}px)`;
    heroContent.style.opacity   = `${1 - scrollY / (vh * 0.75)}`;
  }
  if (spiderEmblem) {
    // emblema se move mais devagar — profundidade
    spiderEmblem.style.transform =
      `translate(-50%, calc(-52% + ${scrollY * 0.12}px))`;
  }
});


// ─── 6. CURSOR TEIA (rastro ao mover o mouse) ──
// Pequenos pontos vermelhos que somem
const trailCanvas = document.createElement('canvas');
trailCanvas.style.cssText =
  'position:fixed;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:999;';
document.body.appendChild(trailCanvas);
const tCtx = trailCanvas.getContext('2d');

function resizeTrail() {
  trailCanvas.width  = window.innerWidth;
  trailCanvas.height = window.innerHeight;
}
resizeTrail();
window.addEventListener('resize', resizeTrail);

let trail = [];
window.addEventListener('mousemove', e => {
  trail.push({ x: e.clientX, y: e.clientY, life: 1 });
  if (trail.length > 28) trail.shift();
});

function animateTrail() {
  tCtx.clearRect(0, 0, trailCanvas.width, trailCanvas.height);
  trail.forEach((p, i) => {
    p.life -= 0.045;
    if (p.life <= 0) return;
    tCtx.beginPath();
    tCtx.arc(p.x, p.y, 2.2 * p.life, 0, Math.PI * 2);
    tCtx.fillStyle = `rgba(192, 21, 42, ${p.life * 0.55})`;
    tCtx.fill();
    // mini linha conectando ao próximo ponto
    if (trail[i + 1]) {
      tCtx.beginPath();
      tCtx.moveTo(p.x, p.y);
      tCtx.lineTo(trail[i + 1].x, trail[i + 1].y);
      tCtx.strokeStyle = `rgba(192, 50, 80, ${p.life * 0.3})`;
      tCtx.lineWidth = 0.8;
      tCtx.stroke();
    }
  });
  trail = trail.filter(p => p.life > 0);
  requestAnimationFrame(animateTrail);
}
animateTrail();


// ─── 7. HOVER NAS IMAGENS DA GALERIA ──────────
document.querySelectorAll('.gallery-item').forEach(item => {
  item.addEventListener('mouseenter', () => {
    item.style.boxShadow = '0 0 30px rgba(192, 21, 42, 0.45), 0 0 0 1px rgba(192,21,42,0.3)';
  });
  item.addEventListener('mouseleave', () => {
    item.style.boxShadow = '';
  });
});
