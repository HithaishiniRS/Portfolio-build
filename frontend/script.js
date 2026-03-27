/**
 * script.js — Hithiaishini Portfolio
 * Handles: theme toggle, typewriter tagline, review loading, review submission, modal
 */

const API_BASE = window.location.hostname === "localhost"
  ? "http://localhost:5000/api"
  : "/api";                          // same origin on Render

/* ─── Helpers ─────────────────────────────────────────────────────────────── */

const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => [...document.querySelectorAll(sel)];

function show(el)  { el.hidden = false; }
function hide(el)  { el.hidden = true;  }
function setText(el, text) { el.textContent = text; }

/* ─── Footer year ──────────────────────────────────────────────────────────── */
setText($("#year"), new Date().getFullYear());

/* ─── Theme Toggle ─────────────────────────────────────────────────────────── */
(function initTheme() {
  const root   = document.documentElement;
  const btn    = $("#themeToggle");
  const stored = localStorage.getItem("theme");
  const preferred = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  const initial   = stored || preferred;

  root.setAttribute("data-theme", initial);

  btn.addEventListener("click", () => {
    const next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
    root.setAttribute("data-theme", next);
    localStorage.setItem("theme", next);
  });
})();

/* ─── Typewriter Tagline ───────────────────────────────────────────────────── */
(function initTypewriter() {
  const phrases = [
    "Full-Stack Developer",
    "Cloud & DevOps Enthusiast",
    "Building scalable apps",
    "Always learning. Always shipping.",
  ];

  const el     = $("#tagline");
  let pi       = 0;   // phrase index
  let ci       = 0;   // char index
  let deleting = false;
  const PAUSE_AFTER = 1800;
  const TYPE_SPEED  = 70;
  const DEL_SPEED   = 38;

  function tick() {
    const phrase = phrases[pi];
    if (!deleting) {
      ci++;
      setText(el, phrase.slice(0, ci));
      if (ci === phrase.length) {
        deleting = true;
        setTimeout(tick, PAUSE_AFTER);
        return;
      }
    } else {
      ci--;
      setText(el, phrase.slice(0, ci));
      if (ci === 0) {
        deleting = false;
        pi = (pi + 1) % phrases.length;
      }
    }
    setTimeout(tick, deleting ? DEL_SPEED : TYPE_SPEED);
  }

  setTimeout(tick, 900);   // brief pause before starting
})();

/* ─── Intersection Observer — section animations ───────────────────────────── */
(function initSectionAnimate() {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add("is-visible");
          observer.unobserve(e.target);
        }
      });
    },
    { threshold: 0.12 }
  );

  $$(".section-animate").forEach((el) => observer.observe(el));
})();

/* ─── Reviews ──────────────────────────────────────────────────────────────── */
const reviewsList   = $("#reviewsList");
const reviewsStatus = $("#reviewsStatus");

function formatRelativeTime(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins  = Math.floor(diff / 60_000);
  const hours = Math.floor(diff / 3_600_000);
  const days  = Math.floor(diff / 86_400_000);
  if (mins  <  1) return "just now";
  if (mins  < 60) return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days  <  7) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

function renderReviews(reviews) {
  reviewsList.innerHTML = "";
  if (!reviews.length) {
    reviewsList.innerHTML =
      `<li class="reviews__empty">No reviews yet — be the first! 🎉</li>`;
    return;
  }
  reviews.forEach(({ name, comment, createdAt }) => {
    const li = document.createElement("li");
    li.className = "review-card";
    li.innerHTML = `
      <p class="review-card__name">${escapeHtml(name || "Anonymous")}</p>
      <p class="review-card__time">${formatRelativeTime(createdAt)}</p>
      <p class="review-card__comment">${escapeHtml(comment)}</p>
    `;
    reviewsList.appendChild(li);
  });
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

async function loadReviews() {
  setText(reviewsStatus, "Loading reviews…");
  try {
    const res  = await fetch(`${API_BASE}/reviews`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    setText(reviewsStatus, "");
    renderReviews(data);
  } catch (err) {
    setText(reviewsStatus, "Could not load reviews. Please try again later.");
    console.error("loadReviews:", err);
  }
}

loadReviews();

/* ─── Modal ────────────────────────────────────────────────────────────────── */
const modal        = $("#reviewModal");
const openBtn      = $("#openReviewModal");
const closeBtn     = $("#closeModalBtn");
const backdrop     = $("#modalBackdrop");
const reviewForm   = $("#reviewForm");
const nameInput    = $("#reviewName");
const commentInput = $("#reviewComment");
const commentError = $("#commentError");
const formError    = $("#formError");
const formSuccess  = $("#formSuccess");
const submitBtn    = $("#submitReview");
const submitSpinner= $("#submitSpinner");

let focusableEls   = [];
let lastFocused    = null;

function openModal() {
  lastFocused = document.activeElement;
  modal.hidden = false;
  // Small timeout so the `hidden` removal paints before the transition class is added
  requestAnimationFrame(() => modal.classList.add("is-open"));
  focusableEls = [...modal.querySelectorAll(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  )];
  focusableEls[0]?.focus();
  document.body.style.overflow = "hidden";
}

function closeModal() {
  modal.classList.remove("is-open");
  modal.addEventListener("transitionend", () => {
    modal.hidden = true;
  }, { once: true });
  document.body.style.overflow = "";
  lastFocused?.focus();
  resetForm();
}

function resetForm() {
  reviewForm.reset();
  hide(commentError);
  hide(formError);
  hide(formSuccess);
}

openBtn.addEventListener("click",    openModal);
closeBtn.addEventListener("click",   closeModal);
backdrop.addEventListener("click",   closeModal);

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && modal.classList.contains("is-open")) closeModal();
  // Trap focus inside modal
  if (e.key === "Tab" && modal.classList.contains("is-open")) {
    const first = focusableEls[0];
    const last  = focusableEls[focusableEls.length - 1];
    if (e.shiftKey ? document.activeElement === first : document.activeElement === last) {
      e.preventDefault();
      (e.shiftKey ? last : first).focus();
    }
  }
});

/* ─── Review Form Submission ───────────────────────────────────────────────── */
reviewForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  hide(commentError);
  hide(formError);
  hide(formSuccess);

  const name    = nameInput.value.trim();
  const comment = commentInput.value.trim();

  if (!comment) {
    show(commentError);
    setText(commentError, "Please write a comment before submitting.");
    commentInput.focus();
    return;
  }

  // Disable UI while submitting
  submitBtn.disabled = true;
  show(submitSpinner);

  try {
    const res = await fetch(`${API_BASE}/reviews`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: name || "Anonymous", comment }),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || `Server error ${res.status}`);
    }

    show(formSuccess);
    setText(formSuccess, "✅ Thanks for your review!");
    reviewForm.reset();
    await loadReviews();    // refresh list

    setTimeout(() => {
      hide(formSuccess);
      closeModal();
    }, 1800);

  } catch (err) {
    show(formError);
    setText(formError, err.message || "Something went wrong. Please try again.");
  } finally {
    submitBtn.disabled = false;
    hide(submitSpinner);
  }
});
