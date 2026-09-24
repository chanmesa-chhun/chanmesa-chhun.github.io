/* ===========================
   Site Nav: scroll shadow + mobile toggle
   =========================== */
const siteNav = document.getElementById("siteNav");
const navToggle = document.getElementById("navToggle");
const navLinks = document.getElementById("navLinks");

window.addEventListener("scroll", () => {
  if (!siteNav) return;
  siteNav.classList.toggle("is-scrolled", window.scrollY > 12);
});

if (navToggle && navLinks) {
  navToggle.addEventListener("click", () => {
    const isOpen = navLinks.classList.toggle("is-open");
    navToggle.classList.toggle("is-open", isOpen);
    navToggle.setAttribute("aria-expanded", isOpen);
  });

  navLinks.querySelectorAll(".nav-link").forEach((link) => {
    link.addEventListener("click", () => {
      navLinks.classList.remove("is-open");
      navToggle.classList.remove("is-open");
      navToggle.setAttribute("aria-expanded", false);
    });
  });
}

/* ===========================
   Copy Email button (Contact page)
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
      if (hint) hint.textContent = "Couldn’t copy automatically. Please select and copy.";
    }
    setTimeout(() => {
      if (hint) hint.textContent = "";
    }, 1800);
  });
}

/* ===========================
   Footer year (auto-updates so you never have to touch it)
   =========================== */
const yearEl = document.getElementById("year");
if (yearEl) yearEl.textContent = new Date().getFullYear();