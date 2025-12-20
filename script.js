/* ===========================
   Snap Scroll (Hero + About + Projects)
   - Desktop only (> 900px)
   - Snaps between hero/about/projects
   - When you reach Projects and scroll DOWN → snapping turns OFF (free scroll)
   - When you scroll UP and the TOP of Projects comes into view → snapping turns ON
   - Keeps currentIndex synced to actual scroll position to prevent jumping to top
   =========================== */

const snapSections = [
  document.querySelector(".hero-section"),
  document.querySelector(".about-section"),
  document.querySelector(".projects-section"), // make sure your projects <section> has this class
].filter(Boolean);

let currentIndex = 0;
let isAnimating = false;
let wheelBuffer = 0;
let snapEnabled = true;

const WHEEL_THRESHOLD = 120;
const SNAP_DURATION = 1400;

function isDesktop() {
  return window.innerWidth > 900;
}

/* ---------- easing ---------- */
function easeInOutCubic(t) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

function smoothScrollTo(targetY, duration = SNAP_DURATION) {
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

/* ---------- keep index in sync ---------- */
function syncCurrentIndex() {
  if (!snapSections.length) return;

  // Bias towards what’s actually in view (a bit below top of viewport)
  const y = window.scrollY + window.innerHeight * 0.25;

  let best = 0;
  let bestDist = Infinity;

  snapSections.forEach((sec, i) => {
    const dist = Math.abs(sec.offsetTop - y);
    if (dist < bestDist) {
      bestDist = dist;
      best = i;
    }
  });

  currentIndex = best;
}

/* ---------- snapping ---------- */
function goTo(index) {
  if (!snapEnabled) return;
  if (isAnimating) return;
  if (index < 0 || index >= snapSections.length) return;

  isAnimating = true;
  wheelBuffer = 0;
  currentIndex = index;

  smoothScrollTo(snapSections[index].offsetTop, SNAP_DURATION);
}

/* ---------- wheel ---------- */
window.addEventListener(
  "wheel",
  (e) => {
    if (!isDesktop()) return;
    if (!snapEnabled) return;
    if (isAnimating) return;

    // Keep index accurate so we don’t jump to wrong section
    syncCurrentIndex();

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

  syncCurrentIndex();

  if (["ArrowDown", "PageDown", " "].includes(e.key)) goTo(currentIndex + 1);
  if (["ArrowUp", "PageUp"].includes(e.key)) goTo(currentIndex - 1);
  if (e.key === "Home") goTo(0);
  if (e.key === "End") goTo(snapSections.length - 1);
});

/* ---------- enable/disable snap around projects top ---------- */
/*
  When TOP of projects is visible:
  - scrolling DOWN → snap OFF (let user freely scroll projects)
  - scrolling UP   → snap ON  (so it can snap back to About/Hero)
*/
const projects = document.querySelector(".projects-section");
let lastScrollY = window.scrollY;

if (projects) {
  const observer = new IntersectionObserver(
    ([entry]) => {
      const scrollingUp = window.scrollY < lastScrollY;
      lastScrollY = window.scrollY;

      if (!entry.isIntersecting) return;

      if (scrollingUp) {
        snapEnabled = true;
        wheelBuffer = 0;

        const projectsIndex = snapSections.indexOf(projects);
        currentIndex = projectsIndex;

        // optional: snap immediately to the top of Projects once
        if (!isAnimating) goTo(projectsIndex);
      } else {
        snapEnabled = false;
      }
    },
    {
      // Trigger when the top of Projects is near the top-ish of viewport
      rootMargin: "-20% 0px -80% 0px",
      threshold: 0,
    }
  );

  observer.observe(projects);
}

/* ---------- keep snap state sane on resize ---------- */
window.addEventListener("resize", () => {
  // When switching to mobile size, stop snapping mid-animation feel
  if (!isDesktop()) {
    snapEnabled = false;
    isAnimating = false;
    wheelBuffer = 0;
    return;
  }

  // Back to desktop: allow snapping again (and sync index)
  snapEnabled = true;
  syncCurrentIndex();
});

/* ---------- reset on load (optional) ---------- */
// If you DON'T want it to force top on refresh, remove the scrollTo(0,0) line.
window.history.scrollRestoration = "manual";

window.addEventListener("load", () => {
  window.scrollTo(0, 0);
  currentIndex = 0;
  snapEnabled = true;
});

/* ===========================
   Copy Email button (optional)
   =========================== */
const btn = document.getElementById("copyEmailBtn");
const hint = document.getElementById("copyEmailHint");
const email = "mesachan50@gmail.com";

if (btn) {
  btn.addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(email);
      if (hint) hint.textContent = "Copied email to clipboard";
    } catch (e) {
      if (hint) hint.textContent = "Couldn’t copy automatically — please select and copy.";
    }
    setTimeout(() => {
      if (hint) hint.textContent = "";
    }, 1800);
  });
}
