// Automatic Content Loader
// بارگذاری خودکار محتوا از API

import { getArticles } from './api.js';

// بارگذاری یادداشت‌های پیشنهادی
export async function loadSuggestedNotes() {
  try {
    // بارگذاری از JSON
    const response = await fetch('/data/articles.json');
    const data = await response.json();
    const articles = data.articles || [];
    
    const notesContainer = document.getElementById('notes');
    
    if (!notesContainer || articles.length === 0) return;
    
    // نمایش 4 مقاله اخیر
    const recentArticles = articles.slice(0, 4);
    
    notesContainer.innerHTML = recentArticles.map(article => `
      <li class="note-item">
        <a href="/article/${article.id}" style="display: flex; gap: var(--space-md); text-decoration: none; color: inherit;">
          <img src="${article.image || `https://picsum.photos/seed/${article.id}/64/64`}" alt="${article.title}" />
          <div>
            <h4>${article.title}</h4>
            <time>${new Date(article.date).toLocaleDateString('fa-IR')}</time>
          </div>
        </a>
      </li>
    `).join('');
  } catch (error) {
    console.info('ℹ️ Suggested notes not loaded (optional)');
  }
}

// بارگذاری مقاله ویژه
export async function loadFeaturedArticle() {
  try {
    // بارگذاری از JSON
    const response = await fetch('/data/articles.json');
    const data = await response.json();
    const articles = data.articles || [];
    
    const featuredCard = document.querySelector('.featured-card');
    
    if (!featuredCard || articles.length === 0) return;
    
    // اولین مقاله به عنوان ویژه
    const featured = articles[0];
    
    const featuredBody = featuredCard.querySelector('.featured-body');
    if (featuredBody) {
      featuredBody.innerHTML = `
        <div class="badge-row">
          <span class="badge">${featured.category || 'ویژه'}</span>
          <span class="reading-time"><span class="dot"></span> ${calculateReadingTime(featured.content)} دقیقه</span>
        </div>
        <h2>${featured.title}</h2>
        <p>${featured.excerpt || featured.content.substring(0, 150)}...</p>
        <a href="/article/${featured.id}" class="btn btn-red">مطالعه</a>
      `;
    }
    
    // تنظیم تصویر پس‌زمینه
    const featuredMedia = featuredCard.querySelector('.featured-media');
    if (featuredMedia && featured.image) {
      featuredMedia.style.backgroundImage = `url(${featured.image})`;
    }
  } catch (error) {
    console.info('ℹ️ Featured article not loaded (optional)');
  }
}

// بارگذاری ابزارها
export async function loadTools() {
  try {
    // بارگذاری از JSON
    const response = await fetch('/data/tools.json');
    
    // بررسی وضعیت پاسخ
    if (!response.ok) {
      console.log('Tools data not available, skipping...');
      return;
    }
    
    const data = await response.json();
    const tools = data.tools || [];
    
    if (!tools || tools.length === 0) return;
    
    // تفکیک ابزارها بر اساس دسته‌بندی
    const gamingTools = tools.filter(t => t.category === 'gaming');
    const utilityTools = tools.filter(t => t.category !== 'gaming');
    
    // بارگذاری ابزارهای گیمینگ
    const gamingGrid = document.querySelector('#tools .tool-grid');
    if (gamingGrid && gamingTools.length > 0) {
      gamingGrid.innerHTML = gamingTools.slice(0, 6).map(tool => createToolCard(tool)).join('');
    }
    
    // بارگذاری ابزارهای کاربردی
    const utilityGrid = document.querySelectorAll('#tools .tool-grid')[1];
    if (utilityGrid && utilityTools.length > 0) {
      utilityGrid.innerHTML = utilityTools.slice(0, 6).map(tool => createToolCard(tool)).join('');
    }
    
    // تنظیم لینک "همه"
    const moreLinks = document.querySelectorAll('#tools .more');
    moreLinks.forEach(link => {
      link.href = '/tools';
    });
  } catch (error) {
    // خطا را سایلنت کن - ابزارها اختیاری هستند
    console.info('ℹ️ Tools not loaded (optional)');
  }
}

// ایجاد کارت ابزار
function createToolCard(tool) {
  return `
    <div class="tool-card">
      <div class="tool-icon">${tool.icon || '🔧'}</div>
      <h4>${tool.name}</h4>
      <p>${tool.description}</p>
      <a href="${tool.link}" class="btn btn-ghost btn-sm" target="_blank" rel="noopener">دانلود</a>
    </div>
  `;
}

// محاسبه زمان مطالعه (تقریبی)
function calculateReadingTime(content) {
  const wordsPerMinute = 200;
  const words = content.split(/\s+/).length;
  const minutes = Math.ceil(words / wordsPerMinute);
  return minutes;
}

// لینک‌دهی خودکار کارت‌های promo
export function setupPromoLinks() {
  const promoCards = document.querySelectorAll('.promo-card');
  
  promoCards.forEach((card, index) => {
    const arrow = card.querySelector('.promo-arrow');
    if (arrow) {
      arrow.addEventListener('click', () => {
        // لینک به صفحات مربوطه
        if (index === 0) {
          // کارت ایران در خاموشی
          window.location.href = '/blog?category=ایران-در-خاموشی';
        } else if (index === 1) {
          // کارت پادکست
          window.location.href = '/blog?category=پادکست';
        }
      });
    }
  });
}

// بارگذاری همه محتوا
export async function loadAllContent() {
  await Promise.all([
    loadSuggestedNotes(),
    loadFeaturedArticle(),
    loadTools()
  ]);
  
  setupPromoLinks();
}
