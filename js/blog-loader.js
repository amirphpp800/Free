// Blog Page Dynamic Loader
// بارگذاری خودکار لیست یادداشت‌ها در صفحه بلاگ

// تبدیل اعداد انگلیسی به فارسی
function convertToPersianNumber(num) {
  const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
  return String(num).replace(/\d/g, digit => persianDigits[digit]);
}

// محاسبه زمان مطالعه
function calculateReadingTime(content) {
  const wordsPerMinute = 200;
  const words = content.split(/\s+/).length;
  const minutes = Math.ceil(words / wordsPerMinute);
  return convertToPersianNumber(minutes);
}

// بارگذاری یادداشت‌ها
async function loadBlogArticles() {
  const articlesGrid = document.getElementById('articlesGrid');
  
  if (!articlesGrid) return;
  
  try {
    // نمایش لودینگ
    articlesGrid.innerHTML = `
      <div style="grid-column: 1/-1; text-align: center; padding: 3rem;">
        <div style="display: inline-block; width: 40px; height: 40px; border: 3px solid rgba(157, 9, 19, 0.3); border-top-color: var(--red); border-radius: 50%; animation: spin 1s linear infinite;"></div>
        <p style="margin-top: 1rem; color: var(--muted);">در حال بارگذاری یادداشت‌ها...</p>
      </div>
    `;
    
    // بارگذاری از JSON
    const response = await fetch('/data/articles.json');
    const data = await response.json();
    const articles = data.articles || [];
    
    // فیلتر یادداشت‌های منتشر شده و مرتب‌سازی بر اساس تاریخ
    const publishedArticles = articles
      .filter(article => article.published)
      .sort((a, b) => new Date(b.date) - new Date(a.date));
    
    if (publishedArticles.length === 0) {
      articlesGrid.innerHTML = `
        <div style="grid-column: 1/-1; text-align: center; padding: 3rem;">
          <p style="color: var(--muted);">هنوز یادداشتی منتشر نشده است.</p>
        </div>
      `;
      return;
    }
    
    // نمایش یادداشت‌ها
    articlesGrid.innerHTML = publishedArticles.map(article => `
      <article class="blog-card">
        ${article.image ? `
          <div class="blog-card-image" style="background-image: url('${article.image}')">
            <div class="blog-card-category">${article.category || 'عمومی'}</div>
          </div>
        ` : `
          <div class="blog-card-image" style="background: linear-gradient(135deg, rgba(157, 9, 19, 0.2), rgba(157, 9, 19, 0.05))">
            <div class="blog-card-category">${article.category || 'عمومی'}</div>
          </div>
        `}
        <div class="blog-card-content">
          <h3 class="blog-card-title">
            <a href="/article/${article.id}">${article.title}</a>
          </h3>
          <p class="blog-card-excerpt">${article.excerpt || article.content.substring(0, 150)}...</p>
          <div class="blog-card-meta">
            <span class="meta-item">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="16" y1="2" x2="16" y2="6"></line>
                <line x1="8" y1="2" x2="8" y2="6"></line>
                <line x1="3" y1="10" x2="21" y2="10"></line>
              </svg>
              ${new Date(article.date).toLocaleDateString('fa-IR')}
            </span>
            <span class="meta-item">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"></circle>
                <polyline points="12 6 12 12 16 14"></polyline>
              </svg>
              ${calculateReadingTime(article.content)} دقیقه
            </span>
          </div>
          <div class="blog-card-footer">
            <div class="blog-card-tags">
              ${(article.tags || []).slice(0, 3).map(tag => 
                `<span class="tag">${tag}</span>`
              ).join('')}
            </div>
            <a href="/article/${article.id}" class="blog-card-link">
              ادامه مطلب
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="5" y1="12" x2="19" y2="12"></line>
                <polyline points="12 5 19 12 12 19"></polyline>
              </svg>
            </a>
          </div>
        </div>
      </article>
    `).join('');
    
    // افزودن استایل انیمیشن
    const style = document.createElement('style');
    style.textContent = `
      @keyframes spin {
        to { transform: rotate(360deg); }
      }
      
      .blog-card {
        animation: fadeInUp 0.5s ease forwards;
        opacity: 0;
      }
      
      .blog-card:nth-child(1) { animation-delay: 0.1s; }
      .blog-card:nth-child(2) { animation-delay: 0.2s; }
      .blog-card:nth-child(3) { animation-delay: 0.3s; }
      .blog-card:nth-child(4) { animation-delay: 0.4s; }
      .blog-card:nth-child(5) { animation-delay: 0.5s; }
      .blog-card:nth-child(6) { animation-delay: 0.6s; }
      
      @keyframes fadeInUp {
        from {
          opacity: 0;
          transform: translateY(20px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
    `;
    document.head.appendChild(style);
    
  } catch (error) {
    console.error('Error loading articles:', error);
    articlesGrid.innerHTML = `
      <div style="grid-column: 1/-1; text-align: center; padding: 3rem;">
        <p style="color: var(--red);">خطا در بارگذاری یادداشت‌ها. لطفاً دوباره تلاش کنید.</p>
      </div>
    `;
  }
}

// فیلتر یادداشت‌ها بر اساس دسته‌بندی
function filterByCategory(category) {
  const cards = document.querySelectorAll('.blog-card');
  
  cards.forEach(card => {
    const cardCategory = card.querySelector('.blog-card-category').textContent;
    
    if (category === 'all' || cardCategory === category) {
      card.style.display = 'block';
    } else {
      card.style.display = 'none';
    }
  });
}

// جستجو در یادداشت‌ها
function searchArticles(query) {
  const cards = document.querySelectorAll('.blog-card');
  const searchQuery = query.toLowerCase().trim();
  
  if (!searchQuery) {
    cards.forEach(card => card.style.display = 'block');
    return;
  }
  
  cards.forEach(card => {
    const title = card.querySelector('.blog-card-title').textContent.toLowerCase();
    const excerpt = card.querySelector('.blog-card-excerpt').textContent.toLowerCase();
    const tags = Array.from(card.querySelectorAll('.tag')).map(tag => tag.textContent.toLowerCase()).join(' ');
    
    if (title.includes(searchQuery) || excerpt.includes(searchQuery) || tags.includes(searchQuery)) {
      card.style.display = 'block';
    } else {
      card.style.display = 'none';
    }
  });
}

// اجرای خودکار
if (window.location.pathname.includes('/blog')) {
  document.addEventListener('DOMContentLoaded', loadBlogArticles);
}

// Export برای استفاده در جاهای دیگر
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { loadBlogArticles, filterByCategory, searchArticles };
}
