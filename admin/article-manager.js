// Article Manager for Admin Panel
// مدیریت کامل مقالات با قابلیت ویرایش و افزودن تصویر

let currentEditingId = null;

// درج Markdown
window.insertMarkdown = function(type) {
  const textarea = document.getElementById('articleContent');
  const start = textarea.selectionStart;
  const end = textarea.selectionEnd;
  const selectedText = textarea.value.substring(start, end);
  let insertion = '';
  let cursorOffset = 0;
  
  switch(type) {
    case 'h2':
      insertion = `## ${selectedText || 'عنوان بخش'}`;
      cursorOffset = 3;
      break;
    case 'h3':
      insertion = `### ${selectedText || 'زیرعنوان'}`;
      cursorOffset = 4;
      break;
    case 'bold':
      insertion = `**${selectedText || 'متن ضخیم'}**`;
      cursorOffset = 2;
      break;
    case 'italic':
      insertion = `*${selectedText || 'متن کج'}*`;
      cursorOffset = 1;
      break;
    case 'list':
      insertion = `- ${selectedText || 'آیتم لیست'}`;
      cursorOffset = 2;
      break;
    case 'link':
      insertion = `[${selectedText || 'متن لینک'}](url)`;
      cursorOffset = selectedText ? insertion.length - 4 : 1;
      break;
    case 'image':
      const imageName = prompt('نام فایل تصویر (مثال: photo.png):');
      if (imageName) {
        insertion = `![توضیح تصویر](/assets/images/${imageName})\n*کپشن زیر تصویر*`;
      }
      break;
    case 'quote':
      insertion = `> ${selectedText || 'نقل قول'}`;
      cursorOffset = 2;
      break;
    case 'code':
      insertion = `\`${selectedText || 'کد'}\``;
      cursorOffset = 1;
      break;
  }
  
  if (insertion) {
    textarea.value = textarea.value.substring(0, start) + insertion + textarea.value.substring(end);
    textarea.focus();
    if (!selectedText) {
      textarea.setSelectionRange(start + cursorOffset, start + cursorOffset + (selectedText ? 0 : insertion.length - cursorOffset * 2));
    }
  }
};

// انتخاب تصویر از فایل‌ها
window.selectImageFromFiles = function() {
  const images = ['war.png', 'sms.png', 'ai.png', 'audio.png', 'head-banner.png'];
  const imageList = images.map((img, i) => `${i + 1}. ${img}`).join('\n');
  const selection = prompt(`تصاویر موجود:\n${imageList}\n\nنام فایل را وارد کنید:`);
  
  if (selection) {
    document.getElementById('articleImage').value = `/assets/images/${selection}`;
  }
};

// پیش‌نمایش مقاله
window.previewArticle = function() {
  const title = document.getElementById('articleTitle').value;
  const content = document.getElementById('articleContent').value;
  const category = document.getElementById('articleCategory').value;
  
  if (!title || !content) {
    alert('لطفاً عنوان و محتوا را وارد کنید');
    return;
  }
  
  // تبدیل Markdown به HTML
  const htmlContent = markdownToHtml(content);
  
  // ایجاد مودال پیش‌نمایش
  const modal = document.createElement('div');
  modal.className = 'preview-modal show';
  modal.innerHTML = `
    <div class="preview-content">
      <div class="preview-header">
        <div>
          <h2 style="margin: 0;">${title}</h2>
          <span class="badge" style="margin-top: 8px;">${category}</span>
        </div>
        <button class="preview-close" onclick="closePreview()">×</button>
      </div>
      <div class="preview-body article-body">
        ${htmlContent}
      </div>
    </div>
  `;
  
  document.body.appendChild(modal);
};

window.closePreview = function() {
  const modal = document.querySelector('.preview-modal');
  if (modal) modal.remove();
};

// تبدیل Markdown به HTML
function markdownToHtml(markdown) {
  let html = markdown;
  
  // عناوین
  html = html.replace(/^### (.+)$/gm, '<h3>$1</h3>');
  html = html.replace(/^## (.+)$/gm, '<h2>$1</h2>');
  html = html.replace(/^# (.+)$/gm, '<h1>$1</h1>');
  
  // تصاویر با کپشن
  html = html.replace(/!\[([^\]]*)\]\(([^)]+)\)\n\*([^*]+)\*/g, 
    '<figure style="margin: 2rem 0;"><img src="$2" alt="$1" style="width: 100%; border-radius: 12px;" /><figcaption style="text-align: center; color: var(--muted); margin-top: 0.5rem; font-style: italic;">$3</figcaption></figure>');
  
  // تصاویر بدون کپشن
  html = html.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, 
    '<img src="$2" alt="$1" style="width: 100%; border-radius: 12px; margin: 2rem 0;" />');
  
  // لینک‌ها
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');
  
  // ضخیم
  html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  
  // کج
  html = html.replace(/\*([^*]+)\*/g, '<em>$1</em>');
  
  // نقل قول
  html = html.replace(/^> (.+)$/gm, '<blockquote class="article-quote"><p>$1</p></blockquote>');
  
  // لیست‌ها
  html = html.replace(/^- (.+)$/gm, '<li>$1</li>');
  html = html.replace(/(<li>.*<\/li>\n?)+/g, '<ul class="article-list">$&</ul>');
  
  // پاراگراف‌ها
  html = html.split('\n\n').map(para => {
    if (para.startsWith('<h') || para.startsWith('<ul') || para.startsWith('<blockquote') || para.startsWith('<img') || para.startsWith('<figure')) {
      return para;
    }
    return `<p>${para.replace(/\n/g, '<br>')}</p>`;
  }).join('\n');
  
  return html;
}

// ذخیره مقاله در JSON
async function saveArticleToJSON(articleData) {
  try {
    // بارگذاری JSON فعلی
    const response = await fetch('/data/articles.json');
    const data = await response.json();
    let articles = data.articles || [];
    
    if (currentEditingId) {
      // ویرایش مقاله موجود
      const index = articles.findIndex(a => a.id === currentEditingId);
      if (index !== -1) {
        articles[index] = { ...articles[index], ...articleData, id: currentEditingId };
      }
    } else {
      // افزودن مقاله جدید
      const newId = generateSlug(articleData.title);
      articleData.id = newId;
      articleData.slug = newId;
      articles.unshift(articleData); // اضافه کردن به ابتدا
    }
    
    // ذخیره در localStorage برای نمایش فوری
    localStorage.setItem('articles', JSON.stringify({ articles }));
    
    // در محیط واقعی، باید به API ارسال شود
    console.log('Article saved:', articleData);
    
    return true;
  } catch (error) {
    console.error('Error saving article:', error);
    return false;
  }
}

// تولید slug از عنوان
function generateSlug(title) {
  const persianToEnglish = {
    'ا': 'a', 'ب': 'b', 'پ': 'p', 'ت': 't', 'ث': 's', 'ج': 'j', 'چ': 'ch',
    'ح': 'h', 'خ': 'kh', 'د': 'd', 'ذ': 'z', 'ر': 'r', 'ز': 'z', 'ژ': 'zh',
    'س': 's', 'ش': 'sh', 'ص': 's', 'ض': 'z', 'ط': 't', 'ظ': 'z', 'ع': 'a',
    'غ': 'gh', 'ف': 'f', 'ق': 'gh', 'ک': 'k', 'گ': 'g', 'ل': 'l', 'م': 'm',
    'ن': 'n', 'و': 'v', 'ه': 'h', 'ی': 'y', ' ': '-', '؛': '', '،': ''
  };
  
  let slug = title.toLowerCase();
  for (let [persian, english] of Object.entries(persianToEnglish)) {
    slug = slug.split(persian).join(english);
  }
  
  slug = slug.replace(/[^a-z0-9-]/g, '').replace(/-+/g, '-');
  return slug + '-' + Date.now();
}

// بارگذاری مقالات
async function loadArticlesFromJSON() {
  try {
    // ابتدا از localStorage بخوان
    const cached = localStorage.getItem('articles');
    if (cached) {
      const data = JSON.parse(cached);
      return data.articles || [];
    }
    
    // در غیر این صورت از فایل
    const response = await fetch('/data/articles.json');
    const data = await response.json();
    return data.articles || [];
  } catch (error) {
    console.error('Error loading articles:', error);
    return [];
  }
}

// نمایش لیست مقالات
async function displayArticlesList() {
  const articles = await loadArticlesFromJSON();
  const container = document.getElementById('articlesList');
  const totalEl = document.getElementById('articlesTotal');
  
  if (totalEl) totalEl.textContent = articles.length;
  
  if (!container) return;
  
  if (articles.length === 0) {
    container.innerHTML = '<p style="color: var(--muted); text-align: center;">هیچ مقاله‌ای وجود ندارد</p>';
    return;
  }
  
  container.innerHTML = articles.map(article => `
    <div class="item-card">
      <div class="item-info">
        <h4>${article.title}</h4>
        <p>${article.category} • ${new Date(article.date).toLocaleDateString('fa-IR')} • ${article.views || 0} بازدید</p>
      </div>
      <div class="item-actions">
        <button class="btn btn-sm btn-ghost" onclick="editArticle('${article.id}')">ویرایش</button>
        <button class="btn btn-sm btn-ghost" onclick="viewArticle('${article.id}')">مشاهده</button>
        <button class="btn btn-sm btn-ghost" onclick="deleteArticleConfirm('${article.id}')">حذف</button>
      </div>
    </div>
  `).join('');
}

// ویرایش مقاله
window.editArticle = async function(id) {
  const articles = await loadArticlesFromJSON();
  const article = articles.find(a => a.id === id);
  
  if (!article) {
    alert('مقاله یافت نشد');
    return;
  }
  
  currentEditingId = id;
  
  // پر کردن فرم
  document.getElementById('articleTitle').value = article.title;
  document.getElementById('articleExcerpt').value = article.excerpt;
  document.getElementById('articleContent').value = article.content;
  document.getElementById('articleCategory').value = article.category;
  document.getElementById('articleAuthor').value = article.author;
  document.getElementById('articleTags').value = (article.tags || []).join(', ');
  document.getElementById('articleImage').value = article.image || '';
  document.getElementById('articlePublished').checked = article.published !== false;
  
  // تغییر متن دکمه
  document.getElementById('articleFormTitle').textContent = 'ویرایش مقاله';
  document.getElementById('articleSubmitText').textContent = 'به‌روزرسانی مقاله';
  document.getElementById('cancelEditBtn').style.display = 'block';
  
  // اسکرول به فرم
  document.getElementById('articleForm').scrollIntoView({ behavior: 'smooth' });
};

// مشاهده مقاله
window.viewArticle = function(id) {
  window.open(`/article/${id}`, '_blank');
};

// حذف مقاله
window.deleteArticleConfirm = async function(id) {
  if (!confirm('آیا مطمئن هستید که می‌خواهید این مقاله را حذف کنید؟')) {
    return;
  }
  
  try {
    const articles = await loadArticlesFromJSON();
    const filtered = articles.filter(a => a.id !== id);
    
    localStorage.setItem('articles', JSON.stringify({ articles: filtered }));
    
    showAlert('articleAlert', 'مقاله با موفقیت حذف شد', 'success');
    displayArticlesList();
  } catch (error) {
    showAlert('articleAlert', 'خطا در حذف مقاله', 'error');
  }
};

// ریست فرم
window.resetArticleForm = function() {
  currentEditingId = null;
  document.getElementById('articleForm').reset();
  document.getElementById('articleFormTitle').textContent = 'افزودن مقاله جدید';
  document.getElementById('articleSubmitText').textContent = 'انتشار مقاله';
  document.getElementById('cancelEditBtn').style.display = 'none';
};

// ارسال فرم
document.getElementById('articleForm')?.addEventListener('submit', async function(e) {
  e.preventDefault();
  
  const articleData = {
    title: document.getElementById('articleTitle').value,
    excerpt: document.getElementById('articleExcerpt').value,
    content: document.getElementById('articleContent').value,
    category: document.getElementById('articleCategory').value,
    author: document.getElementById('articleAuthor').value,
    tags: document.getElementById('articleTags').value.split(',').map(t => t.trim()).filter(t => t),
    image: document.getElementById('articleImage').value || '/assets/images/default.png',
    published: document.getElementById('articlePublished').checked,
    date: new Date().toISOString(),
    views: 0
  };
  
  const success = await saveArticleToJSON(articleData);
  
  if (success) {
    showAlert('articleAlert', currentEditingId ? 'مقاله با موفقیت به‌روزرسانی شد!' : 'مقاله با موفقیت منتشر شد!', 'success');
    resetArticleForm();
    displayArticlesList();
  } else {
    showAlert('articleAlert', 'خطا در ذخیره مقاله', 'error');
  }
});

// Helper function
function showAlert(elementId, message, type) {
  const element = document.getElementById(elementId);
  if (element) {
    element.innerHTML = `<div class="alert alert-${type}">${message}</div>`;
    setTimeout(() => element.innerHTML = '', 5000);
  }
}

// بارگذاری اولیه
if (document.getElementById('articlesList')) {
  displayArticlesList();
}
