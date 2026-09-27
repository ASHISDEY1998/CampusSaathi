/**
 * CampusSaathi Presentation Interactive Controller
 * Features:
 * - Next / Back slide navigation with smooth transitions
 * - Fullscreen toggle with standard Fallbacks & Escape key support
 * - Dynamic Progress Bar & Slide Indicator
 * - Slide Overview / Thumbnail Drawer
 * - Dark & Light Mode Toggle
 * - Presenter Elapsed Stopwatch
 * - Touch Swipe gesture support on mobile
 * - Keyboard Shortcuts (Arrows, Space, PageUp/Down, F, Esc, G, T)
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

  // Slide Titles for Grid
  const slideTitles = [
    "Cover: CampusSaathi AI Platform",
    "Problem Statement & Motivation",
    "High-Level 3-Tier Architecture",
    "Production Technology Stack",
    "Strict Role-Based Access (RBAC)",
    "RAG AI Pipeline Flowchart",
    "Student Portal Experience",
    "Teacher & Staff Experience",
    "Admin Portal & Directory CRUD",
    "PCHSS Authentic Data Grounding",
    "Future Innovation Roadmap",
    "Conclusion & Team Credits"
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
   * Fullscreen controller with multi-browser fallbacks
   */
  function toggleFullscreen() {
    const doc = document;
    const docEl = document.documentElement;

    const isFullscreen =
      doc.fullscreenElement ||
      doc.webkitFullscreenElement ||
      doc.mozFullScreenElement ||
      doc.msFullscreenElement;

    if (!isFullscreen) {
      // Enter Fullscreen
      if (docEl.requestFullscreen) {
        docEl.requestFullscreen().catch(err => console.warn(err));
      } else if (docEl.webkitRequestFullscreen) {
        docEl.webkitRequestFullscreen();
      } else if (docEl.mozRequestFullScreen) {
        docEl.mozRequestFullScreen();
      } else if (docEl.msRequestFullscreen) {
        docEl.msRequestFullscreen();
      }
    } else {
      // Exit Fullscreen
      if (doc.exitFullscreen) {
        doc.exitFullscreen().catch(err => console.warn(err));
      } else if (doc.webkitExitFullscreen) {
        doc.webkitExitFullscreen();
      } else if (doc.mozCancelFullScreen) {
        doc.mozCancelFullScreen();
      } else if (doc.msExitFullscreen) {
        doc.msExitFullscreen();
      }
    }
  }

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
    if (gridModal.classList.contains('open')) {
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
        if (gridModal.classList.contains('open')) {
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
        // If in fullscreen, document handles exit automatically;
        // if modal is open, it closes.
        if (gridModal.classList.contains('open')) {
          closeGridModal();
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

  // Initialize slide 0
  goToSlide(0);
})();
