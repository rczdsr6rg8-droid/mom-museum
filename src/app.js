// src/app.js
import { slides } from "./slides.js";
import { applyFX, createParticles } from "./effects.js";

// DOM
const photo = document.getElementById("photo");
const bg = document.getElementById("bg");

const dateEl = document.getElementById("date");
const titleEl = document.getElementById("title");
const captionEl = document.getElementById("caption");

const prevBtn = document.getElementById("prev");
const nextBtn = document.getElementById("next");

// FX layers (must exist in index.html)
const fxGlowEl = document.getElementById("fxGlow");
const fxLeakEl = document.getElementById("fxLeak");
const fxCanvas = document.getElementById("fxParticles");
const particles = createParticles(fxCanvas);

// state
let index = 0;

// init
wireControls();
render(index, true);

function wireControls() {
  prevBtn?.addEventListener("click", prev);
  nextBtn?.addEventListener("click", next);

  window.addEventListener("keydown", (e) => {
    if (e.key === "ArrowLeft") prev();
    if (e.key === "ArrowRight") next();
  });
}

function prev() {
  index = (index - 1 + slides.length) % slides.length;
  render(index);
}

function next() {
  index = (index + 1) % slides.length;
  render(index);
}

/**
 * Render slide by index
 * @param {number} i
 * @param {boolean} instant - first render without animation
 */
function render(i, instant = false) {
  const slide = slides[i];

  // Text
  if (dateEl) dateEl.textContent = slide.date ?? "";
  if (titleEl) titleEl.textContent = slide.title ?? "";
  if (captionEl) captionEl.textContent = slide.caption ?? "";

  // FX
  if (fxGlowEl && fxLeakEl) applyFX({ fxGlowEl, fxLeakEl }, slide.fx || {});
  if (particles) particles.start(slide.fx?.particles || {});

  // Final slide (no image)
  if (!slide.src) {
    if (bg) bg.style.backgroundImage = "none";
    if (photo) {
      if (!instant) photo.classList.add("is-switching");
      setTimeout(() => {
        photo.removeAttribute("src");
        photo.alt = slide.title || "Поздравление";
        photo.classList.remove("is-switching");
      }, instant ? 0 : 220);
    }
    return;
  }

  // Smooth transition
  if (!instant && photo) photo.classList.add("is-switching");

  const nextSrc = slide.src;

  // Background image
  if (bg) bg.style.backgroundImage = `url(${nextSrc})`;

  // Preload before swap (so no flicker)
  const img = new Image();
  img.onload = () => {
    if (!photo) return;

    photo.src = nextSrc;
    photo.alt = slide.title || "Фото";

    // remove blur/fade after a short moment
    requestAnimationFrame(() => {
      if (instant) {
        photo.classList.remove("is-switching");
      } else {
        setTimeout(() => photo.classList.remove("is-switching"), 30);
      }
    });
  };
  img.src = nextSrc;
}
