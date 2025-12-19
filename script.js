const sections = Array.from(document.querySelectorAll("main section"));
let currentIndex = 0;
let isAnimating = false;
let wheelBuffer = 0;

const WHEEL_THRESHOLD = 120;

function isDesktop() {
  return window.innerWidth > 900;
}

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

    if (progress < 1) {
      requestAnimationFrame(animate);
    } else {
      isAnimating = false;
    }
  }

  requestAnimationFrame(animate);
}

function goTo(index) {
  if (index < 0 || index >= sections.length) return;
  if (isAnimating) return;

  isAnimating = true;
  wheelBuffer = 0;
  currentIndex = index;

  smoothScrollTo(sections[index].offsetTop);
}

window.addEventListener(
  "wheel",
  (e) => {
    if (!isDesktop()) return;
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

window.addEventListener("keydown", (e) => {
  if (!isDesktop()) return;
  if (isAnimating) return;

  if (["ArrowDown", "PageDown", " "].includes(e.key)) goTo(currentIndex + 1);
  if (["ArrowUp", "PageUp"].includes(e.key)) goTo(currentIndex - 1);
  if (e.key === "Home") goTo(0);
  if (e.key === "End") goTo(sections.length - 1);
});

window.history.scrollRestoration = "manual";

window.addEventListener("load", () => {
  window.scrollTo(0, 0);
  currentIndex = 0;
});
