/**
 * PENDING PUSH - INTERACTION CONTROLLER
 * Zero emojis, clean SVG feedback, and seamless client state
 */

document.addEventListener('DOMContentLoaded', () => {
  // 1. CODE COPY ACTION WITH CLEAN FEEDBACK
  const copyBtns = document.querySelectorAll('.code-copy-action');
  copyBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const block = btn.closest('.code-container') || btn.closest('.code-block');
      const code = block ? block.querySelector('code') : null;
      if (code) {
        navigator.clipboard.writeText(code.innerText).then(() => {
          const originalHTML = btn.innerHTML;
          btn.innerHTML = `<span class="icon icon-sm"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg></span> Copied`;
          btn.style.color = '#34d399';
          setTimeout(() => {
            btn.innerHTML = originalHTML;
            btn.style.color = '';
          }, 2000);
        });
      }
    });
  });

  // 2. TUTORIAL STEP COMPLETION CHECKLIST & PROGRESS
  const stepCheckboxes = document.querySelectorAll('.step-check-trigger');
  const tutorialProgressFill = document.querySelector('.tutorial-progress-fill');
  const tutorialProgressText = document.querySelector('.tutorial-progress-text');

  function updateTutorialProgress() {
    if (!stepCheckboxes.length) return;
    const total = stepCheckboxes.length;
    const completed = document.querySelectorAll('.step-check-trigger.completed').length;
    const pct = Math.round((completed / total) * 100);

    if (tutorialProgressFill) tutorialProgressFill.style.width = `${pct}%`;
    if (tutorialProgressText) tutorialProgressText.innerText = `${completed} of ${total} steps completed (${pct}%)`;
  }

  stepCheckboxes.forEach(btn => {
    btn.addEventListener('click', () => {
      const isDone = btn.classList.toggle('completed');
      const checkIcon = btn.querySelector('.check-indicator');
      if (checkIcon) {
        checkIcon.innerHTML = isDone 
          ? `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>`
          : ``;
      }
      updateTutorialProgress();
    });
  });

  // 3. CONFESSIONS: RELATE COUNTER TOGGLE
  const relateBtns = document.querySelectorAll('.relate-button');
  relateBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const countEl = btn.querySelector('.relate-count');
      if (!countEl) return;
      let count = parseInt(countEl.innerText.replace(/,/g, ''), 10) || 0;
      const isActive = btn.classList.toggle('active');

      if (isActive) {
        count++;
        btn.querySelector('svg').setAttribute('fill', 'currentColor');
      } else {
        count = Math.max(0, count - 1);
        btn.querySelector('svg').setAttribute('fill', 'none');
      }
      countEl.innerText = count.toLocaleString();
    });
  });

  // 4. CONFESSION COMPOSE MODAL
  const openModalBtn = document.querySelector('[data-open-confession]');
  const closeModalBtn = document.querySelector('[data-close-confession]');
  const confessionModal = document.getElementById('confessionModal');

  if (openModalBtn && confessionModal) {
    openModalBtn.addEventListener('click', () => confessionModal.style.display = 'flex');
  }
  if (closeModalBtn && confessionModal) {
    closeModalBtn.addEventListener('click', () => confessionModal.style.display = 'none');
  }
  if (confessionModal) {
    confessionModal.addEventListener('click', (e) => {
      if (e.target === confessionModal) confessionModal.style.display = 'none';
    });
  }

  // 5. RANDOM POST SHUFFLE
  const randomDiceBtn = document.getElementById('randomShuffleBtn');
  if (randomDiceBtn) {
    randomDiceBtn.addEventListener('click', () => {
      randomDiceBtn.disabled = true;
      randomDiceBtn.style.opacity = '0.7';
      const targets = ['post-dev.html', 'post-simple.html', 'tutorial.html'];
      const nextTarget = targets[Math.floor(Math.random() * targets.length)];
      setTimeout(() => {
        window.location.href = nextTarget;
      }, 350);
    });
  }
});
