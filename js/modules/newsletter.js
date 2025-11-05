/* ========================================
   Newsletter Module
   ======================================== */

export function initNewsletter() {
  const form = document.querySelector('.newsletter-form');
  
  if (!form) return;
  
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const input = form.querySelector('input[type=email]');
    const button = form.querySelector('button[type=submit]');
    
    if (!input || !button) return;
    
    // Validate email
    const email = input.value.trim();
    if (!isValidEmail(email)) {
      showMessage(form, 'لطفاً یک ایمیل معتبر وارد کنید', 'error');
      return;
    }
    
    // Disable form
    input.setAttribute('disabled', '');
    button.setAttribute('disabled', '');
    button.textContent = 'در حال ثبت...';
    
    // Simulate API call
    setTimeout(() => {
      showMessage(form, 'با موفقیت ثبت شد ✔️', 'success');
      input.value = '';
    }, 1000);
  });
}

function isValidEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

function showMessage(form, message, type) {
  // Remove existing message
  const existing = form.parentElement.querySelector('.form-message');
  if (existing) existing.remove();
  
  const messageEl = document.createElement('p');
  messageEl.className = `form-message form-message--${type}`;
  messageEl.textContent = message;
  messageEl.style.cssText = `
    color: ${type === 'success' ? '#4ade80' : '#ef4444'};
    margin: 12px 0 0;
    font-size: 0.9rem;
    animation: slideIn 0.3s ease;
  `;
  
  form.insertAdjacentElement('afterend', messageEl);
  
  // Remove after 5 seconds
  setTimeout(() => {
    messageEl.style.animation = 'slideOut 0.3s ease';
    setTimeout(() => messageEl.remove(), 300);
  }, 5000);
}
