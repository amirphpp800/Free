/* ========================================
   Navigation Module
   ======================================== */

export function initNavigation() {
  const toggle = document.querySelector('.mobile-menu-toggle');
  const nav = document.querySelector('.nav');
  
  if (!toggle || !nav) return;
  
  // Toggle mobile menu
  toggle.addEventListener('click', () => {
    toggle.classList.toggle('active');
    nav.classList.toggle('active');
    
    // Update ARIA
    const isExpanded = nav.classList.contains('active');
    toggle.setAttribute('aria-expanded', isExpanded);
  });
  
  // Close menu when clicking outside
  document.addEventListener('click', (e) => {
    if (!toggle.contains(e.target) && !nav.contains(e.target)) {
      toggle.classList.remove('active');
      nav.classList.remove('active');
      toggle.setAttribute('aria-expanded', 'false');
    }
  });
  
  // Close menu on escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && nav.classList.contains('active')) {
      toggle.classList.remove('active');
      nav.classList.remove('active');
      toggle.setAttribute('aria-expanded', 'false');
      toggle.focus();
    }
  });
  
  // Highlight active page
  const currentPath = window.location.pathname;
  const navLinks = nav.querySelectorAll('a');
  
  navLinks.forEach(link => {
    const href = link.getAttribute('href');
    
    // Check if current page matches link
    if (href === currentPath || 
        (currentPath === '/' && href === '/') ||
        (currentPath.includes('/tools') && href === '/tools') ||
        (currentPath.includes('/blog') && href === '/blog') ||
        (currentPath.includes('/about') && href === '/about')) {
      link.classList.add('active');
      link.setAttribute('aria-current', 'page');
    }
  });
}
