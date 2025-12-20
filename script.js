const snapSections = [
  document.querySelector(".hero-section"),
  document.querySelector(".about-section"),
  document.querySelector(".projects-section"),
].filter(Boolean);

let currentIndex = 0;
let isAnimating = false;
let wheelBuffer = 0;
let snapEnabled = true;

const WHEEL_THRESHOLD = 120;

function isDesktop() {
  return window.innerWidth > 900;
}

/* ---------- easing ---------- */
function easeInOutCubic(t) {
  return t < 0.5
    ? 4 * t * t * t
    : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

function smoothScrollTo(targetY, duration = 1400) {
  const startY = window.pageYOffset;
  const distance = targetY - startY;
  let startTime = null;

  function animate(time) {
    if (!startTime) startTime = time;
    const progress = Math.min((time - startTime) / duration, 1);
    const eased = easeInOutCubic(progress);

    window.scrollTo(0, startY + distance * eased);

    if (progress < 1) requestAnimationFrame(animate);
    else isAnimating = false;
  }

  requestAnimationFrame(animate);
}

/* ---------- snapping ---------- */
function goTo(index) {
  if (!snapEnabled) return;
  if (index < 0 || index >= snapSections.length) return;
  if (isAnimating) return;

  isAnimating = true;
  wheelBuffer = 0;
  currentIndex = index;

  smoothScrollTo(snapSections[index].offsetTop);
}

/* ---------- wheel ---------- */
window.addEventListener(
  "wheel",
  (e) => {
    if (!isDesktop()) return;
    if (!snapEnabled) return;
    if (isAnimating) return;

    wheelBuffer += e.deltaY;

    if (wheelBuffer > WHEEL_THRESHOLD) {
      wheelBuffer = 0;
      goTo(currentIndex + 1);
    } else if (wheelBuffer < -WHEEL_THRESHOLD) {
      wheelBuffer = 0;
      goTo(currentIndex - 1);
    }
  },
  { passive: true }
);

/* ---------- keyboard ---------- */
window.addEventListener("keydown", (e) => {
  if (!isDesktop()) return;
  if (!snapEnabled) return;
  if (isAnimating) return;

  if (["ArrowDown", "PageDown", " "].includes(e.key)) goTo(currentIndex + 1);
  if (["ArrowUp", "PageUp"].includes(e.key)) goTo(currentIndex - 1);
});

/* ---------- smart snap re-enable ---------- */
/*
  When TOP of projects is visible:
  - scrolling DOWN → snap OFF
  - scrolling UP → snap ON again
*/
const projects = document.querySelector(".projects-section");

let lastScrollY = window.scrollY;

const observer = new IntersectionObserver(
  ([entry]) => {
    const scrollingUp = window.scrollY < lastScrollY;
    lastScrollY = window.scrollY;

    if (entry.isIntersecting) {
      if (scrollingUp) {
        snapEnabled = true;
        currentIndex = 1; // about-section
      } else {
        snapEnabled = false;
      }
    }
  },
  {
    rootMargin: "-20% 0px -80% 0px",
    threshold: 0,
  }
);

observer.observe(projects);

/* ---------- reset on load ---------- */
window.history.scrollRestoration = "manual";

window.addEventListener("load", () => {
  window.scrollTo(0, 0);
  currentIndex = 0;
  snapEnabled = true;
});
