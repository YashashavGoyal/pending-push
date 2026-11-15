/**
 * BLOGSPHERE - MAIN APPLICATION SCRIPT
 * Handles theme switching, mobile drawer navigation, dropdowns, and global UX
 */

(function () {
  'use strict';

  // 1. THEME MANAGEMENT (Dark / Light Mode)
  const THEME_KEY = 'blogsphere-theme';
  
  function getPreferredTheme() {
    const savedTheme = localStorage.getItem(THEME_KEY);
    if (savedTheme) return savedTheme;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }

  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem(THEME_KEY, theme);
    
    // Update theme toggle button icon if present
    const toggleBtns = document.querySelectorAll('.theme-toggle-btn');
    toggleBtns.forEach(btn => {
      btn.innerHTML = theme === 'dark' ? '☀️' : '🌙';
      btn.setAttribute('aria-label', `Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`);
    });
  }

  // Initialize theme immediately
  const initialTheme = getPreferredTheme();
  applyTheme(initialTheme);

  // 2. DOM CONTENT LOADED EVENT LISTENERS
  document.addEventListener('DOMContentLoaded', () => {
    // Theme toggle buttons click
    const toggleBtns = document.querySelectorAll('.theme-toggle-btn');
    toggleBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        applyTheme(newTheme);
      });
    });

    // Mobile Navigation Drawer Toggle
    const mobileToggleBtn = document.querySelector('.mobile-nav-toggle');
    const mobileDrawer = document.querySelector('.mobile-drawer');

    if (mobileToggleBtn && mobileDrawer) {
      mobileToggleBtn.addEventListener('click', () => {
        const isOpen = mobileDrawer.classList.toggle('open');
        mobileToggleBtn.innerHTML = isOpen ? '✕' : '☰';
      });
    }

    // User Avatar Dropdown Menu
    const userMenuBtn = document.querySelector('.user-avatar-btn');
    const userDropdown = document.querySelector('.dropdown-menu');

    if (userMenuBtn && userDropdown) {
      userMenuBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        userDropdown.classList.toggle('show');
      });

      document.addEventListener('click', (e) => {
        if (!userMenuBtn.contains(e.target) && !userDropdown.contains(e.target)) {
          userDropdown.classList.remove('show');
        }
      });
    }

    // Highlight current active link in navigation
    const currentPath = window.location.pathname.split('/').pop() || 'index.html';
    const navLinks = document.querySelectorAll('.nav-links a, .mobile-drawer a');
    navLinks.forEach(link => {
      const href = link.getAttribute('href');
      if (href && (href === currentPath || (currentPath === '' && href === 'index.html'))) {
        link.classList.add('active');
      }
    });

    // Reading Progress Bar (if present on the page)
    const progressBar = document.querySelector('.reading-progress-bar');
    if (progressBar) {
      window.addEventListener('scroll', () => {
        const docElem = document.documentElement;
        const totalHeight = docElem.scrollHeight - docElem.clientHeight;
        if (totalHeight > 0) {
          const scrollPercent = (docElem.scrollTop / totalHeight) * 100;
          progressBar.style.width = `${scrollPercent}%`;
        }
      }, { passive: true });
    }
  });
})();
