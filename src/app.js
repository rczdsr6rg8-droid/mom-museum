import { slides } from "./slides.js";
import { applyFX, createParticles } from "./effects.js";

import { applyFX, createParticles } from "./effects.js";
import { slides } from "./slides.js";

const photo = document.getElementById("photo");
const bg = document.getElementById("bg");
const dateEl = document.getElementById("date");
const titleEl = document.getElementById("title");
const captionEl = document.getElementById("caption");

const prevBtn = document.getElementById("prev");
const nextBtn = document.getElementById("next");

let index = 0;

function render(i) {
  const slide = slides[i];

  dateEl.textContent = slide.date;
  titleEl.textContent = slide.title;
  captionEl.textContent = slide.caption;

  if (slide.src) {
    photo.src = slide.src;
    bg.style.backgroundImage = `url(${slide.src})`;
  } else {
    photo.src = "";
    bg.style.backgroundImage = "none";
  }
}

prevBtn.onclick = () => {
  index = (index - 1 + slides.length) % slides.length;
  render(index);
};

nextBtn.onclick = () => {
  index = (index + 1) % slides.length;
  render(index);
};

render(index);

