/**
 * BLOGSPHERE - INTERACTIVE UX ENHANCEMENTS
 * Powers tabs, copy-to-clipboard, tutorial checklists, confession modals, and filter actions
 */

document.addEventListener('DOMContentLoaded', () => {
  // 1. CODE COPY TO CLIPBOARD
  const copyBtns = document.querySelectorAll('.code-copy-btn');
  copyBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const codeBlock = btn.closest('.code-block');
      const codeSnippet = codeBlock ? codeBlock.querySelector('code') : null;
      if (codeSnippet) {
        navigator.clipboard.writeText(codeSnippet.innerText).then(() => {
          const originalText = btn.innerText;
          btn.innerText = '✓ Copied!';
          btn.style.color = '#34d399';
          setTimeout(() => {
            btn.innerText = originalText;
            btn.style.color = '';
          }, 2000);
        }).catch(err => {
          console.error('Failed to copy text: ', err);
        });
      }
    });
  });

  // 2. TAB SWITCHING (Feed, Profile, Settings)
  const tabContainers = document.querySelectorAll('[data-tab-group]');
  tabContainers.forEach(container => {
    const tabs = container.querySelectorAll('[data-tab-target]');
    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        const targetSelector = tab.getAttribute('data-tab-target');
        
        // Remove active class from all tabs in this container
        tabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');

        // Hide/Show tab contents in the group
        const groupName = container.getAttribute('data-tab-group');
        const contents = document.querySelectorAll(`[data-tab-content="${groupName}"]`);
        contents.forEach(content => {
          if ('#' + content.id === targetSelector || content.getAttribute('data-tab-id') === targetSelector) {
            content.style.display = 'block';
          } else {
            content.style.display = 'none';
          }
        });
      });
    });
  });

  // 3. TUTORIAL STEP COMPLETION CHECKLIST & PROGRESS
  const stepCheckboxes = document.querySelectorAll('.step-checkbox-btn');
  const tutorialProgressFill = document.querySelector('.tutorial-progress-fill');
  const tutorialProgressText = document.querySelector('.tutorial-progress-text');

  function updateTutorialProgress() {
    if (!stepCheckboxes.length || !tutorialProgressFill) return;
    const total = stepCheckboxes.length;
    const completed = document.querySelectorAll('.step-checkbox-btn.checked').length;
    const percent = Math.round((completed / total) * 100);

    tutorialProgressFill.style.width = `${percent}%`;
    if (tutorialProgressText) {
      tutorialProgressText.innerText = `${completed} of ${total} steps completed (${percent}%)`;
    }
  }

  stepCheckboxes.forEach(btn => {
    btn.addEventListener('click', () => {
      const isChecked = btn.classList.toggle('checked');
      btn.querySelector('.checkbox-label').innerText = isChecked ? '✓ Completed' : 'Mark as Complete';
      const card = btn.closest('.tutorial-step-card');
      if (card) {
        card.classList.toggle('completed', isChecked);
      }
      updateTutorialProgress();
    });
  });

  // 4. CONFESSIONS: RELATE COUNTER TOGGLE
  const relateBtns = document.querySelectorAll('.relate-btn');
  relateBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const countSpan = btn.querySelector('.relate-count');
      if (!countSpan) return;
      let count = parseInt(countSpan.innerText.replace(/,/g, ''), 10) || 0;
      const isRelating = btn.classList.toggle('active');

      if (isRelating) {
        count++;
        btn.style.backgroundColor = 'var(--accent-rose)';
        btn.style.color = '#ffffff';
      } else {
        count = Math.max(0, count - 1);
        btn.style.backgroundColor = '';
        btn.style.color = '';
      }
      countSpan.innerText = count.toLocaleString();
    });
  });

  // 5. CONFESSION MODAL DIALOG
  const openModalBtn = document.querySelector('[data-open-confession-modal]');
  const closeModalBtn = document.querySelector('[data-close-confession-modal]');
  const confessionModal = document.getElementById('confessionModal');

  if (openModalBtn && confessionModal) {
    openModalBtn.addEventListener('click', () => {
      confessionModal.style.display = 'flex';
    });
  }

  if (closeModalBtn && confessionModal) {
    closeModalBtn.addEventListener('click', () => {
      confessionModal.style.display = 'none';
    });
  }

  if (confessionModal) {
    confessionModal.addEventListener('click', (e) => {
      if (e.target === confessionModal) {
        confessionModal.style.display = 'none';
      }
    });
  }

  // 6. RANDOM POST "SURPRISE ME" SHUFFLE ANIMATION
  const shuffleBtn = document.getElementById('shuffleRandomBtn');
  if (shuffleBtn) {
    shuffleBtn.addEventListener('click', () => {
      shuffleBtn.innerHTML = '🎲 Shuffling...';
      shuffleBtn.style.opacity = '0.7';
      setTimeout(() => {
        // Pick random post from mock data and redirect or reload view
        const sampleSlugs = [
          'post-dev.html',
          'post-simple.html',
          'tutorial.html'
        ];
        const randomTarget = sampleSlugs[Math.floor(Math.random() * sampleSlugs.length)];
        window.location.href = randomTarget;
      }, 500);
    });
  }

  // 7. FEED SEARCH FILTER
  const feedSearchInput = document.querySelector('.feed-search-input');
  if (feedSearchInput) {
    feedSearchInput.addEventListener('input', (e) => {
      const query = e.target.value.toLowerCase().trim();
      const postCards = document.querySelectorAll('.post-card');
      postCards.forEach(card => {
        const title = (card.querySelector('.post-card-title') || {}).innerText || '';
        const excerpt = (card.querySelector('.post-card-excerpt') || {}).innerText || '';
        const isMatch = title.toLowerCase().includes(query) || excerpt.toLowerCase().includes(query);
        card.style.display = isMatch ? 'flex' : 'none';
      });
    });
  }
});
