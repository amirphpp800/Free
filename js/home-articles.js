// Home Page Articles Loader
// نمایش آخرین یادداشت‌ها در صفحه اصلی

// تبدیل اعداد انگلیسی به فارسی
function convertToPersianNumber(num) {
  const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
  return String(num).replace(/\d/g, digit => persianDigits[digit]);
}

// بارگذاری آخرین یادداشت‌ها برای صفحه اصلی
async function loadHomeArticles() {
  const articlesContainer = document.querySelector('.home-articles-grid');
  
  if (!articlesContainer) return;
  
  try {
    // بارگذاری از JSON
    const response = await fetch('/data/articles.json');
    const data = await response.json();
    const articles = data.articles || [];
    
    // فیلتر و مرتب‌سازی - فقط 3 یادداشت آخر
    const latestArticles = articles
      .filter(article => article.published)
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 3);
    
    if (latestArticles.length === 0) {
      articlesContainer.innerHTML = `
        <div style="grid-column: 1/-1; text-align: center; padding: 2rem;">
          <p style="color: var(--muted);">به زودی یادداشت‌های جدید منتشر می‌شود</p>
        </div>
      `;
      return;
    }
    
    // نمایش یادداشت‌ها
    articlesContainer.innerHTML = latestArticles.map(article => `
      <article class="article-card">
        <a href="/article/${article.id}" class="article-card-link">
          ${article.image ? `
            <div class="article-card-image" style="background-image: url('${article.image}')">
              <div class="article-card-overlay"></div>
              <span class="article-card-category">${article.category || 'عمومی'}</span>
            </div>
          ` : `
            <div class="article-card-image" style="background: linear-gradient(135deg, rgba(157, 9, 19, 0.2), rgba(157, 9, 19, 0.05))">
              <div class="article-card-overlay"></div>
              <span class="article-card-category">${article.category || 'عمومی'}</span>
            </div>
          `}
          <div class="article-card-content">
            <h3 class="article-card-title">${article.title}</h3>
            <p class="article-card-excerpt">${article.excerpt || article.content.substring(0, 120)}...</p>
            <div class="article-card-meta">
              <span class="meta-date">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                  <line x1="16" y1="2" x2="16" y2="6"></line>
                  <line x1="8" y1="2" x2="8" y2="6"></line>
                  <line x1="3" y1="10" x2="21" y2="10"></line>
                </svg>
                ${new Date(article.date).toLocaleDateString('fa-IR')}
              </span>
              <span class="meta-arrow">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                  <polyline points="12 5 19 12 12 19"></polyline>
                </svg>
              </span>
            </div>
          </div>
        </a>
      </article>
    `).join('');
    
    // افزودن استایل‌های اضافی برای کارت‌های مقاله در صفحه اصلی
    if (!document.getElementById('home-articles-styles')) {
      const style = document.createElement('style');
      style.id = 'home-articles-styles';
      style.textContent = `
        .home-articles-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: var(--space-xl);
          margin-top: var(--space-xl);
        }
        
        .article-card {
          background: rgba(20, 20, 25, 0.6);
          border: 1px solid rgba(255, 255, 255, 0.05);
          border-radius: var(--radius-xl);
          overflow: hidden;
          transition: all 0.3s ease;
          backdrop-filter: blur(10px);
        }
        
        .article-card:hover {
          transform: translateY(-5px);
          border-color: rgba(157, 9, 19, 0.5);
          box-shadow: 0 10px 30px rgba(157, 9, 19, 0.2);
        }
        
        .article-card-link {
          text-decoration: none;
          color: inherit;
          display: block;
        }
        
        .article-card-image {
          width: 100%;
          height: 200px;
          background-size: cover;
          background-position: center;
          position: relative;
        }
        
        .article-card-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(180deg, transparent 0%, rgba(10, 10, 15, 0.8) 100%);
        }
        
        .article-card-category {
          position: absolute;
          top: var(--space-md);
          right: var(--space-md);
          background: var(--red);
          color: white;
          padding: 6px 14px;
          border-radius: 20px;
          font-size: 0.8rem;
          font-weight: 700;
          z-index: 1;
        }
        
        .article-card-content {
          padding: var(--space-lg);
        }
        
        .article-card-title {
          font-size: 1.15rem;
          font-weight: 800;
          color: #ffffff;
          margin: 0 0 var(--space-sm) 0;
          line-height: 1.4;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        
        .article-card-excerpt {
          font-size: 0.9rem;
          color: rgba(255, 255, 255, 0.7);
          line-height: 1.6;
          margin-bottom: var(--space-md);
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        
        .article-card-meta {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-top: var(--space-sm);
          border-top: 1px solid rgba(255, 255, 255, 0.05);
        }
        
        .meta-date {
          display: flex;
          align-items: center;
          gap: 6px;
          color: var(--muted);
          font-size: 0.85rem;
        }
        
        .meta-arrow {
          color: var(--red);
          display: flex;
          align-items: center;
          transition: transform 0.2s;
        }
        
        .article-card:hover .meta-arrow {
          transform: translateX(-4px);
        }
        
        @media (max-width: 768px) {
          .home-articles-grid {
            grid-template-columns: 1fr;
          }
        }
      `;
      document.head.appendChild(style);
    }
    
  } catch (error) {
    console.error('Error loading home articles:', error);
    articlesContainer.innerHTML = `
      <div style="grid-column: 1/-1; text-align: center; padding: 2rem;">
        <p style="color: var(--red);">خطا در بارگذاری یادداشت‌ها</p>
      </div>
    `;
  }
}

// اجرای خودکار در صفحه اصلی
if (window.location.pathname === '/' || window.location.pathname === '/index.html') {
  document.addEventListener('DOMContentLoaded', loadHomeArticles);
}

// Export
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { loadHomeArticles };
}
