// Request access functionality

// Make functions globally available
window.openAccessModal = function() {
  const modal = document.getElementById('access-modal');
  if (modal) {
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden'; // Prevent background scrolling
  } else {
    console.error('Access modal not found');
  }
};

window.closeAccessModal = function() {
  const modal = document.getElementById('access-modal');
  if (modal) {
    modal.style.display = 'none';
    document.body.style.overflow = ''; // Restore scrolling
  }
};

// Handle form submission
document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('access-form');
  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const formData = new FormData(form);
      const data = {
        email: formData.get('email'),
        name: formData.get('name'),
        use_case: formData.get('use_case')
      };

      const submitBtn = form.querySelector('button[type="submit"]');
      const originalText = submitBtn.textContent;
      submitBtn.disabled = true;
      submitBtn.textContent = 'Submitting...';

      try {
        // For now, just show success (you can add API call later)
        setTimeout(() => {
          submitBtn.textContent = '✓ Submitted!';
          submitBtn.style.background = '#22c55e';
          
          setTimeout(() => {
            closeAccessModal();
            form.reset();
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
            submitBtn.style.background = '';
            
            // Show success message
            alert('Thanks! We\'ll be in touch soon.');
          }, 1500);
        }, 500);
      } catch (error) {
        submitBtn.textContent = 'Error - Try again';
        submitBtn.disabled = false;
        setTimeout(() => {
          submitBtn.textContent = originalText;
        }, 2000);
      }
    });
  }

  // Close modal on outside click
  const modal = document.getElementById('access-modal');
  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        closeAccessModal();
      }
    });
  }

  // Close on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeAccessModal();
    }
  });
});

