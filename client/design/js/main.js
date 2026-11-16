/**
 * PENDING PUSH - MAIN CONTROLLER
 * Theme state, mobile drawer, dropdown menus, and icon SVG rendering
 */

(function () {
  'use strict';

  // SVG Icons Definition (Zero emojis)
  const ICONS = {
    sun: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/></svg>`,
    moon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>`,
    check: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`
  };

  const THEME_KEY = 'pending-push-theme';

  function getSavedTheme() {
    const saved = localStorage.getItem(THEME_KEY);
    if (saved) return saved;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }

  function setTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem(THEME_KEY, theme);

    const toggleBtns = document.querySelectorAll('.theme-toggle-btn');
    toggleBtns.forEach(btn => {
      btn.innerHTML = `<span class="icon">${theme === 'dark' ? ICONS.sun : ICONS.moon}</span>`;
      btn.setAttribute('title', `Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`);
    });
  }

  // Initialize early
  setTheme(getSavedTheme());

  document.addEventListener('DOMContentLoaded', () => {
    // Theme toggle listener
    const toggleBtns = document.querySelectorAll('.theme-toggle-btn');
    toggleBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const current = document.documentElement.getAttribute('data-theme') || 'light';
        setTheme(current === 'dark' ? 'light' : 'dark');
      });
    });

    // Mobile nav toggle
    const mobileBtn = document.querySelector('.mobile-nav-toggle');
    const mobileDrawer = document.querySelector('.mobile-drawer');
    if (mobileBtn && mobileDrawer) {
      mobileBtn.addEventListener('click', () => {
        const isOpen = mobileDrawer.classList.toggle('open');
        mobileBtn.setAttribute('aria-expanded', isOpen);
      });
    }

    // User dropdown toggle
    const userBtn = document.querySelector('.user-avatar-btn');
    const userMenu = document.querySelector('.dropdown-menu');
    if (userBtn && userMenu) {
      userBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        userMenu.classList.toggle('show');
      });

      document.addEventListener('click', (e) => {
        if (!userBtn.contains(e.target) && !userMenu.contains(e.target)) {
          userMenu.classList.remove('show');
        }
      });
    }

    // Active path highlighter
    const currentPath = window.location.pathname.split('/').pop() || 'index.html';
    const navLinks = document.querySelectorAll('.spaces-nav a, .mobile-drawer a');
    navLinks.forEach(link => {
      const href = link.getAttribute('href');
      if (href && (href === currentPath || (currentPath === '' && href === 'index.html'))) {
        link.classList.add('active');
      }
    });

    // Reading progress line
    const progressBar = document.querySelector('.reading-progress-bar');
    if (progressBar) {
      window.addEventListener('scroll', () => {
        const total = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        if (total > 0) {
          const pct = (document.documentElement.scrollTop / total) * 100;
          progressBar.style.width = `${pct}%`;
        }
      }, { passive: true });
    }
  });
})();
