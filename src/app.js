// src/app.js
import { slides } from "./slides.js";
import { applyFX, createParticles, attachParallax } from "./effects.js";

// DOM
const photo = document.getElementById("photo");
const bg = document.getElementById("bg");

const dateEl = document.getElementById("date");
const titleEl = document.getElementById("title");
const captionEl = document.getElementById("caption");

const prevBtn = document.getElementById("prev");
const nextBtn = document.getElementById("next");

// Final screen
const final = document.getElementById("final");
const finalText = document.getElementById("finalText");

// FX layers
const fxGlowEl = document.getElementById("fxGlow");
const fxLeakEl = document.getElementById("fxLeak");
const fxCanvas = document.getElementById("fxParticles");
const particles = createParticles(fxCanvas);

// state
let index = 0;

// init
wireControls();
attachParallax({ glowEl: fxGlowEl, leakEl: fxLeakEl, strength: 16 });
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

function render(i, instant = false) {
  const slide = slides[i];

  // Text
  if (dateEl) dateEl.textContent = slide.date ?? "";
  if (titleEl) titleEl.textContent = slide.title ?? "";
  if (captionEl) captionEl.textContent = slide.caption ?? "";

  // FX
  if (fxGlowEl && fxLeakEl) applyFX({ fxGlowEl, fxLeakEl }, slide.fx || {});
  particles.start(slide.fx?.particles || {});

  // FINAL: gradient + big text
  if (!slide.src) {
    if (bg) bg.style.backgroundImage = "none";

    // hide photo, show final
    if (photo) {
      photo.classList.add("is-switching");
      setTimeout(() => {
        photo.style.display = "none";
        photo.classList.remove("is-switching");
      }, instant ? 0 : 220);
    }

    if (final) final.style.display = "block";
    if (finalText) finalText.textContent = slide.caption ?? "Желаю всегда быть с улыбкой на лице💗";
    return;
  }

  // PHOTO slide: show photo, hide final
  if (final) final.style.display = "none";
  if (photo) photo.style.display = "block";

  // Smooth transition
  if (!instant && photo) photo.classList.add("is-switching");

  const nextSrc = slide.src;

  // Background image
  if (bg) bg.style.backgroundImage = `url(${nextSrc})`;

  // Preload then swap
  const img = new Image();
  img.onload = () => {
    if (!photo) return;
    photo.src = nextSrc;
    photo.alt = slide.title || "Фото";

    requestAnimationFrame(() => {
      if (instant) photo.classList.remove("is-switching");
      else setTimeout(() => photo.classList.remove("is-switching"), 30);
    });
  };
  img.src = nextSrc;
}


