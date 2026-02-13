// src/effects.js
// Side Rays + LightLeaks + Particles + Mouse Parallax (GT7-ish)

export function applyFX({ fxGlowEl, fxLeakEl }, fx = {}) {
  const glowColor = fx.glowColor ?? "rgba(120,180,255,0.8)";
  const glowStrength = fx.glowStrength ?? 1.0;

  // ONLY SIDE RAYS (left/right) – no center blob
  fxGlowEl.style.background = `
    radial-gradient(900px 600px at 0% 50%, ${glowColor} 0%, rgba(0,0,0,0) 64%),
    radial-gradient(900px 600px at 100% 50%, ${glowColor} 0%, rgba(0,0,0,0) 64%)
  `;
  fxGlowEl.style.opacity = String(clamp(0.22 + 0.55 * glowStrength, 0, 1));

  // Light leaks: we keep only side/top/bottom/center depending on fx
  const leaks = fx.leak ?? [];
  fxLeakEl.style.background = leaks.length
    ? leaks.map((l) => leakGradient(l.at ?? "center", l.color ?? "rgba(255,255,255,0.12)")).join(", ")
    : "none";
}

export function createParticles(canvas) {
  const ctx = canvas.getContext("2d");
  const state = { w: 0, h: 0, dpr: 1, particles: [], cfg: null, raf: null };

  function resize() {
    state.dpr = Math.min(2, window.devicePixelRatio || 1);
    state.w = window.innerWidth;
    state.h = window.innerHeight;

    canvas.width = Math.floor(state.w * state.dpr);
    canvas.height = Math.floor(state.h * state.dpr);
    ctx.setTransform(state.dpr, 0, 0, state.dpr, 0, 0);
  }

  function seed(cfg) {
    state.cfg = cfg ?? {};
    state.particles = [];

    const count = state.cfg.count ?? 70;
    const [minSize, maxSize] = state.cfg.size ?? [1, 3];
    const spread = state.cfg.spread ?? 0.9;

    for (let i = 0; i < count; i++) {
      state.particles.push({
        x: Math.random() * state.w,
        y: Math.random() * state.h,
        r: rand(minSize, maxSize),
        a: rand(0.10, 0.50),
        vx: (Math.random() - 0.5) * spread,
        vy: (Math.random() - 0.5) * spread,
      });
    }
  }

  function tick() {
    const cfg = state.cfg ?? {};
    const speed = cfg.speed ?? 0.25;

    ctx.clearRect(0, 0, state.w, state.h);

    for (const p of state.particles) {
      p.x += p.vx * speed;
      p.y += p.vy * speed;

      if (p.x < -25) p.x = state.w + 25;
      if (p.x > state.w + 25) p.x = -25;
      if (p.y < -25) p.y = state.h + 25;
      if (p.y > state.h + 25) p.y = -25;

      ctx.globalAlpha = p.a;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = "white";
      ctx.fill();
    }

    ctx.globalAlpha = 1;
    state.raf = requestAnimationFrame(tick);
  }

  function start(cfg) {
    stop();
    resize();
    seed(cfg ?? {});
    tick();
  }

  function stop() {
    if (state.raf) cancelAnimationFrame(state.raf);
    state.raf = null;
  }

  window.addEventListener("resize", () => {
    resize();
    if (state.cfg) seed(state.cfg);
  });

  return { start, stop, resize };
}

/**
 * Mouse parallax for glow/leak layers
 * strength: px offset at max
 */
export function attachParallax({ glowEl, leakEl, strength = 14 }) {
  if (!glowEl && !leakEl) return;

  let tx = 0, ty = 0;
  let cx = 0, cy = 0;

  window.addEventListener("mousemove", (e) => {
    cx = (e.clientX / window.innerWidth - 0.5) * 2;
    cy = (e.clientY / window.innerHeight - 0.5) * 2;
    tx = cx * strength;
    ty = cy * strength;
  });

  function animate() {
    if (glowEl) glowEl.style.transform = `translate3d(${tx}px, ${ty}px, 0)`;
    if (leakEl) leakEl.style.transform = `translate3d(${tx * 0.7}px, ${ty * 0.7}px, 0)`;
    requestAnimationFrame(animate);
  }
  animate();
}

/* helpers */
function leakGradient(at, color) {
  switch (at) {
    case "left":
      return `radial-gradient(820px 520px at 0% 50%, ${color} 0%, rgba(0,0,0,0) 62%)`;
    case "right":
      return `radial-gradient(820px 520px at 100% 50%, ${color} 0%, rgba(0,0,0,0) 62%)`;
    case "top":
      return `radial-gradient(920px 520px at 50% 0%, ${color} 0%, rgba(0,0,0,0) 60%)`;
    case "bottom":
      return `radial-gradient(920px 520px at 50% 100%, ${color} 0%, rgba(0,0,0,0) 60%)`;
    case "center":
    default:
      return `radial-gradient(980px 620px at 50% 48%, ${color} 0%, rgba(0,0,0,0) 70%)`;
  }
}

function rand(a, b) { return a + Math.random() * (b - a); }
function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }

