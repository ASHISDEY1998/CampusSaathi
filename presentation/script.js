/**
 * CampusSaathi Presentation Interactive Controller
 * Refined for Baignyanik Medha Anwesha Drive 2026
 * Features:
 * - Robust Native & CSS Viewport Fullscreen (Guaranteed to work in any browser)
 * - Next / Back slide navigation with smooth transitions
 * - Dynamic Progress Bar & Slide Indicator
 * - Slide Overview / Thumbnail Drawer
 * - Dark & Light Mode Toggle
 * - Presenter Elapsed Stopwatch
 * - Touch Swipe gesture support on mobile
 * - Comprehensive Keyboard Shortcuts (Arrows, Space, PageUp/Down, F, Esc, G, T)
 */

(function () {
  'use strict';

  // DOM Elements
  const slides = Array.from(document.querySelectorAll('.slide'));
  const totalSlides = slides.length;
  let currentSlide = 0;

  const progressBar = document.getElementById('progressBar');
  const currentSlideNumEl = document.getElementById('currentSlideNum');
  const totalSlidesNumEl = document.getElementById('totalSlidesNum');
  const btnPrev = document.getElementById('btnPrev');
  const btnNext = document.getElementById('btnNext');
  const btnFullscreen = document.getElementById('btnFullscreen');
  const btnThemeToggle = document.getElementById('btnThemeToggle');
  const btnGrid = document.getElementById('btnGrid');
  const slideIndicator = document.getElementById('slideIndicator');
  const elapsedTimerEl = document.getElementById('elapsedTimer');
  const kbdHint = document.getElementById('kbdHint');

  // Modal elements
  const gridModal = document.getElementById('gridModal');
  const gridModalBackdrop = document.getElementById('gridModalBackdrop');
  const btnCloseGrid = document.getElementById('btnCloseGrid');
  const slideGridContainer = document.getElementById('slideGridContainer');

  // Conclusion buttons
  const btnRestart = document.getElementById('btnRestart');
  const btnToggleFsConclusion = document.getElementById('btnToggleFsConclusion');

  // Initialize display
  if (totalSlidesNumEl) {
    totalSlidesNumEl.textContent = String(totalSlides);
  }

  // Slide Titles for Grid Overview
  const slideTitles = [
    "Welcome: Baignyanik Medha Anwesha 2026",
    "Real Campus Challenges & Examples",
    "3-Tier Architecture & API Definition",
    "Tech Stack & Enterprise Security",
    "Digital Keycards (RBAC), JWT & Routing",
    "RAG AI Pipeline: Phase A & B Explained",
    "Student Portal for All Scholars",
    "Teacher Portal & Academic Tools",
    "Admin Portal: Easy School Management",
    "100% Authentic PCHSS Data Grounding",
    "Roadmap: Smart Gatepass & RFID",
    "Conclusion, Q&A & Mentorship Credits"
  ];

  /**
   * Navigate to a specific slide index
   * @param {number} targetIndex
   */
  function goToSlide(targetIndex) {
    if (targetIndex < 0 || targetIndex >= totalSlides) return;

    slides[currentSlide].classList.remove('active');
    currentSlide = targetIndex;
    slides[currentSlide].classList.add('active');

    // Scroll slide to top in case it was scrolled down
    slides[currentSlide].scrollTop = 0;

    // Update Indicators
    if (currentSlideNumEl) {
      currentSlideNumEl.textContent = String(currentSlide + 1);
    }

    if (progressBar) {
      const percentage = ((currentSlide + 1) / totalSlides) * 100;
      progressBar.style.width = `${percentage}%`;
    }

    // Update Prev / Next button states
    if (btnPrev) {
      btnPrev.disabled = currentSlide === 0;
    }
    if (btnNext) {
      btnNext.disabled = currentSlide === totalSlides - 1;
    }

    // Update active state in grid modal if open
    updateGridCurrentState();
  }

  function nextSlide() {
    if (currentSlide < totalSlides - 1) {
      goToSlide(currentSlide + 1);
    }
  }

  function prevSlide() {
    if (currentSlide > 0) {
      goToSlide(currentSlide - 1);
    }
  }

  /**
   * Robust Fullscreen Controller:
   * Combines Native Fullscreen API + Guaranteed CSS Viewport Fullscreen Mode.
   */
  function isCurrentlyFullscreen() {
    const doc = document;
    return !!(
      doc.fullscreenElement ||
      doc.webkitFullscreenElement ||
      doc.mozFullScreenElement ||
      doc.msFullscreenElement ||
      doc.documentElement.classList.contains('fullscreen-mode')
    );
  }

  function enterFullscreen() {
    const docEl = document.documentElement;

    // 1. Try Native Fullscreen
    if (docEl.requestFullscreen) {
      docEl.requestFullscreen().catch(() => {
        // Fallback to CSS viewport mode
        docEl.classList.add('fullscreen-mode');
        document.body.classList.add('fullscreen-mode');
        updateFullscreenIcons();
      });
    } else if (docEl.webkitRequestFullscreen) {
      docEl.webkitRequestFullscreen();
    } else if (docEl.mozRequestFullScreen) {
      docEl.mozRequestFullScreen();
    } else if (docEl.msRequestFullscreen) {
      docEl.msRequestFullscreen();
    } else {
      // Direct CSS mode fallback
      docEl.classList.add('fullscreen-mode');
      document.body.classList.add('fullscreen-mode');
    }

    // Always ensure CSS fullscreen mode is also applied as safety net
    docEl.classList.add('fullscreen-mode');
    document.body.classList.add('fullscreen-mode');
    updateFullscreenIcons();
  }

  function exitFullscreen() {
    const doc = document;

    if (doc.exitFullscreen && doc.fullscreenElement) {
      doc.exitFullscreen().catch(() => {});
    } else if (doc.webkitExitFullscreen && doc.webkitFullscreenElement) {
      doc.webkitExitFullscreen();
    } else if (doc.mozCancelFullScreen && doc.mozFullScreenElement) {
      doc.mozCancelFullScreen();
    } else if (doc.msExitFullscreen && doc.msFullscreenElement) {
      doc.msExitFullscreen();
    }

    // Remove CSS class fallback
    doc.documentElement.classList.remove('fullscreen-mode');
    document.body.classList.remove('fullscreen-mode');
    updateFullscreenIcons();
  }

  function toggleFullscreen() {
    if (isCurrentlyFullscreen()) {
      exitFullscreen();
    } else {
      enterFullscreen();
    }
  }

  function updateFullscreenIcons() {
    const active = isCurrentlyFullscreen();
    const maxIcons = document.querySelectorAll('.icon-maximize');
    const minIcons = document.querySelectorAll('.icon-minimize');

    maxIcons.forEach(icon => {
      icon.style.display = active ? 'none' : 'block';
    });
    minIcons.forEach(icon => {
      icon.style.display = active ? 'block' : 'none';
    });

    if (btnFullscreen) {
      btnFullscreen.title = active ? 'Exit Full Screen (Esc)' : 'Full Screen (F / Esc to Exit)';
    }
  }

  // Listen to browser native fullscreen change events
  document.addEventListener('fullscreenchange', () => {
    if (!document.fullscreenElement) {
      document.documentElement.classList.remove('fullscreen-mode');
      document.body.classList.remove('fullscreen-mode');
    }
    updateFullscreenIcons();
  });
  document.addEventListener('webkitfullscreenchange', () => {
    if (!document.webkitFullscreenElement) {
      document.documentElement.classList.remove('fullscreen-mode');
      document.body.classList.remove('fullscreen-mode');
    }
    updateFullscreenIcons();
  });

  /**
   * Theme Switcher (Dark / Light)
   */
  function toggleTheme() {
    const isDark = document.body.classList.contains('theme-dark');
    if (isDark) {
      document.body.classList.remove('theme-dark');
      document.body.classList.add('theme-light');
      localStorage.setItem('campussaathi_ppt_theme', 'light');
    } else {
      document.body.classList.remove('theme-light');
      document.body.classList.add('theme-dark');
      localStorage.setItem('campussaathi_ppt_theme', 'dark');
    }
  }

  // Load saved theme
  const savedTheme = localStorage.getItem('campussaathi_ppt_theme');
  if (savedTheme === 'light') {
    document.body.classList.remove('theme-dark');
    document.body.classList.add('theme-light');
  }

  /**
   * Slide Grid Modal Drawer
   */
  function populateSlideGrid() {
    if (!slideGridContainer) return;
    slideGridContainer.innerHTML = '';

    slideTitles.forEach((title, idx) => {
      const card = document.createElement('div');
      card.className = `grid-thumbnail ${idx === currentSlide ? 'current' : ''}`;
      card.innerHTML = `
        <span class="thumb-num">SLIDE ${String(idx + 1).padStart(2, '0')}</span>
        <span class="thumb-title">${title}</span>
      `;
      card.addEventListener('click', () => {
        goToSlide(idx);
        closeGridModal();
      });
      slideGridContainer.appendChild(card);
    });
  }

  function updateGridCurrentState() {
    if (!slideGridContainer) return;
    const cards = slideGridContainer.querySelectorAll('.grid-thumbnail');
    cards.forEach((card, idx) => {
      if (idx === currentSlide) {
        card.classList.add('current');
      } else {
        card.classList.remove('current');
      }
    });
  }

  function openGridModal() {
    populateSlideGrid();
    gridModal.classList.add('open');
  }

  function closeGridModal() {
    gridModal.classList.remove('open');
  }

  /**
   * Presenter Timer
   */
  let secondsElapsed = 0;
  setInterval(() => {
    secondsElapsed++;
    const mins = Math.floor(secondsElapsed / 60);
    const secs = secondsElapsed % 60;
    if (elapsedTimerEl) {
      elapsedTimerEl.textContent = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    }
  }, 1000);

  /**
   * Keyboard Shortcuts
   */
  document.addEventListener('keydown', (e) => {
    // If modal is open, Escape closes it
    if (gridModal && gridModal.classList.contains('open')) {
      if (e.key === 'Escape') {
        closeGridModal();
        e.preventDefault();
        return;
      }
    }

    switch (e.key) {
      case 'ArrowRight':
      case 'PageDown':
      case ' ': // Spacebar
      case 'l':
      case 'n':
        nextSlide();
        e.preventDefault();
        break;

      case 'ArrowLeft':
      case 'PageUp':
      case 'Backspace':
      case 'h':
      case 'p':
        prevSlide();
        e.preventDefault();
        break;

      case 'Home':
        goToSlide(0);
        e.preventDefault();
        break;

      case 'End':
        goToSlide(totalSlides - 1);
        e.preventDefault();
        break;

      case 'f':
      case 'F':
        toggleFullscreen();
        e.preventDefault();
        break;

      case 'g':
      case 'G':
      case 'o':
      case 'O':
        if (gridModal && gridModal.classList.contains('open')) {
          closeGridModal();
        } else {
          openGridModal();
        }
        e.preventDefault();
        break;

      case 't':
      case 'T':
        toggleTheme();
        e.preventDefault();
        break;

      case 'Escape':
        // If in fullscreen or modal, escape restores normal window view
        if (isCurrentlyFullscreen()) {
          exitFullscreen();
          e.preventDefault();
        }
        break;

      default:
        break;
    }
  });

  /**
   * Touch Gesture Support (Swipe left/right)
   */
  let touchStartX = 0;
  let touchStartY = 0;

  document.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].screenX;
    touchStartY = e.changedTouches[0].screenY;
  }, { passive: true });

  document.addEventListener('touchend', (e) => {
    const touchEndX = e.changedTouches[0].screenX;
    const touchEndY = e.changedTouches[0].screenY;

    const diffX = touchEndX - touchStartX;
    const diffY = touchEndY - touchStartY;

    // Only handle horizontal swipes with small vertical deflection
    if (Math.abs(diffX) > 60 && Math.abs(diffY) < 50) {
      if (diffX < 0) {
        nextSlide(); // Swipe Left -> Next
      } else {
        prevSlide(); // Swipe Right -> Prev
      }
    }
  }, { passive: true });

  // Event Listeners for UI Buttons
  if (btnNext) btnNext.addEventListener('click', nextSlide);
  if (btnPrev) btnPrev.addEventListener('click', prevSlide);
  if (btnFullscreen) btnFullscreen.addEventListener('click', toggleFullscreen);
  if (btnThemeToggle) btnThemeToggle.addEventListener('click', toggleTheme);
  if (btnGrid) btnGrid.addEventListener('click', openGridModal);
  if (slideIndicator) slideIndicator.addEventListener('click', openGridModal);
  if (btnCloseGrid) btnCloseGrid.addEventListener('click', closeGridModal);
  if (gridModalBackdrop) gridModalBackdrop.addEventListener('click', closeGridModal);

  // Conclusion buttons
  if (btnRestart) {
    btnRestart.addEventListener('click', () => goToSlide(0));
  }
  if (btnToggleFsConclusion) {
    btnToggleFsConclusion.addEventListener('click', toggleFullscreen);
  }

  // Show shortcut hint toast on start, fade after 5 seconds
  if (kbdHint) {
    setTimeout(() => {
      kbdHint.classList.add('show');
      setTimeout(() => {
        kbdHint.classList.remove('show');
      }, 5500);
    }, 800);
  }

  // Initialize
  updateFullscreenIcons();
  goToSlide(0);
})();
