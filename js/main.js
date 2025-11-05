/* ========================================
   Main JavaScript - ابزارستان
   ======================================== */

import { initNavigation } from './modules/navigation.js';
import { initAnimations } from './modules/animations.js';
import { loadAllContent } from './modules/content-loader.js';

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  initNavigation();
  initAnimations();
  
  // بارگذاری خودکار محتوا
  loadAllContent();
  
  // Smooth scroll for anchor links
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const href = this.getAttribute('href');
      if (href === '#') return;
      
      e.preventDefault();
      const target = document.querySelector(href);
      
      if (target) {
        const headerOffset = 80;
        const elementPosition = target.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
        
        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });
      }
    });
  });
  
  // Add loading state
  document.body.classList.add('loaded');
});

// Loading animation
const loadingStyle = document.createElement('style');
loadingStyle.textContent = `
  body:not(.loaded) {
    opacity: 0;
  }
  
  body.loaded {
    animation: fadeIn 0.3s ease forwards;
  }
  
  @keyframes fadeIn {
    to { opacity: 1; }
  }
`;
document.head.appendChild(loadingStyle);
