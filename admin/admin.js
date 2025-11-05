// Admin Panel JavaScript
import { getArticles, createArticle, deleteArticle } from '../js/modules/api.js';

// Templates Data
const templates = {
  articles: [
    {
      title: 'راهنمای استفاده از VPN',
      icon: '🔒',
      description: 'تمپلیت کامل برای نوشتن راهنمای VPN',
      tags: ['VPN', 'امنیت', 'آموزش'],
      content: {
        title: 'راهنمای کامل استفاده از VPN در ایران',
        excerpt: 'همه چیز درباره VPN و نحوه استفاده امن از آن',
        content: `# راهنمای کامل VPN

## مقدمه
VPN یا Virtual Private Network...

## انواع VPN
1. **VPN رایگان**
2. **VPN پولی**
3. **Self-hosted VPN**

## نحوه استفاده
...`,
        category: 'آموزش',
        tags: 'vpn, امنیت, فیلترشکن'
      }
    },
    {
      title: 'معرفی ابزار امنیتی',
      icon: '🛡️',
      description: 'تمپلیت معرفی ابزارهای امنیتی',
      tags: ['امنیت', 'ابزار'],
      content: {
        title: 'معرفی [نام ابزار]',
        excerpt: 'بررسی کامل ابزار [نام] برای امنیت دیجیتال',
        content: `# معرفی [نام ابزار]

## ویژگی‌ها
- ویژگی 1
- ویژگی 2

## نحوه نصب
...`,
        category: 'امنیت',
        tags: 'امنیت, ابزار'
      }
    },
    {
      title: 'اخبار فناوری',
      icon: '📰',
      description: 'تمپلیت خبر فناوری',
      tags: ['اخبار'],
      content: {
        title: '[عنوان خبر]',
        excerpt: 'خلاصه خبر...',
        content: `# [عنوان خبر]

## جزئیات
...

## منابع
- منبع 1
- منبع 2`,
        category: 'اخبار',
        tags: 'اخبار, فناوری'
      }
    }
  ],
  tools: [
    {
      title: 'VPN Tool',
      icon: '🔒',
      description: 'تمپلیت ابزار VPN',
      tags: ['VPN'],
      content: {
        name: 'نام VPN',
        description: 'توضیحات کوتاه',
        category: 'vpn',
        icon: '🔒',
        link: 'https://example.com'
      }
    },
    {
      title: 'Browser Extension',
      icon: '🌐',
      description: 'تمپلیت افزونه مرورگر',
      tags: ['مرورگر'],
      content: {
        name: 'نام افزونه',
        description: 'توضیحات افزونه',
        category: 'browser',
        icon: '🌐',
        link: 'https://chrome.google.com/webstore'
      }
    }
  ]
};

// Check authentication
function checkAuth() {
  const isAuthenticated = sessionStorage.getItem('admin_authenticated');
  if (isAuthenticated === 'true') {
    showAdminPanel();
    checkSystemStatus();
  } else {
    showLoginScreen();
  }
}

function showLoginScreen() {
  document.getElementById('loginScreen').style.display = 'flex';
  document.getElementById('adminPanel').style.display = 'none';
}

function showAdminPanel() {
  document.getElementById('loginScreen').style.display = 'none';
  document.getElementById('adminPanel').style.display = 'flex';
  loadDashboard();
}

// Login
document.getElementById('loginForm')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;
  
  try {
    const response = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    
    const data = await response.json();
    
    if (data.success) {
      // Set cookie for middleware authentication
      document.cookie = `admin_token=${data.token}; path=/; max-age=86400; SameSite=Strict`;
      
      // Set sessionStorage for client-side state
      sessionStorage.setItem('admin_authenticated', 'true');
      sessionStorage.setItem('admin_token', data.token);
      
      showAdminPanel();
    } else {
      showAlert('loginAlert', data.message || 'نام کاربری یا رمز عبور اشتباه است', 'error');
    }
  } catch (error) {
    showAlert('loginAlert', 'خطا در ارتباط با سرور', 'error');
  }
});

// Logout
window.logout = function() {
  if (confirm('آیا مطمئن هستید؟')) {
    // Clear cookie
    document.cookie = 'admin_token=; path=/; max-age=0';
    
    // Clear sessionStorage
    sessionStorage.clear();
    
    showLoginScreen();
  }
};

// Tab switching
window.switchTab = function(tab) {
  // Update nav
  document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));
  event.target.closest('.nav-item').classList.add('active');
  
  // Update panels
  document.querySelectorAll('.admin-panel').forEach(panel => panel.classList.remove('active'));
  document.getElementById(tab + 'Panel').classList.add('active');
  
  // Update header
  const titles = {
    dashboard: ['داشبورد', 'مدیریت محتوا و سیستم'],
    articles: ['مقالات', 'مدیریت مقالات و محتوا'],
    tools: ['ابزارها', 'مدیریت ابزارها و برنامه‌ها'],
    files: ['فایل‌ها', 'مدیریت و آپلود فایل'],
    templates: ['تمپلیت‌ها', 'استفاده از تمپلیت‌های آماده'],
    settings: ['تنظیمات', 'تنظیمات سیستم و محیط']
  };
  
  if (titles[tab]) {
    document.getElementById('pageTitle').textContent = titles[tab][0];
    document.getElementById('pageSubtitle').textContent = titles[tab][1];
  }
  
  // Load data for specific tabs
  if (tab === 'dashboard') loadDashboard();
  if (tab === 'articles') loadArticles();
  if (tab === 'tools') loadTools();
  if (tab === 'files') loadFiles();
  if (tab === 'templates') loadTemplates();
  if (tab === 'settings') loadSettings();
};

// Check System Status
async function checkSystemStatus() {
  try {
    // Check KV
    const kvResponse = await fetch('/api/stats?type=all');
    if (kvResponse.ok) {
      document.getElementById('kvStatus').textContent = 'متصل';
      document.getElementById('kvStatus').style.color = '#22c55e';
    } else {
      document.getElementById('kvStatus').textContent = 'قطع';
      document.getElementById('kvStatus').style.color = '#ef4444';
    }
    
    // Check ENV
    const envResponse = await fetch('/api/admin/env-check');
    if (envResponse.ok) {
      const data = await envResponse.json();
      document.getElementById('envStatus').textContent = data.status || 'فعال';
    }
  } catch (error) {
    document.getElementById('kvStatus').textContent = 'خطا';
    document.getElementById('envStatus').textContent = 'خطا';
  }
}

// Load Dashboard
async function loadDashboard() {
  try {
    const articles = await getArticles();
    const toolsRes = await fetch('/api/tools');
    const tools = await toolsRes.json();
    
    document.getElementById('articlesCount').textContent = articles.length;
    document.getElementById('toolsCount').textContent = tools.length;
    
    // Recent activity
    const activities = [
      ...articles.slice(0, 3).map(a => ({
        icon: '📝',
        text: `مقاله "${a.title}" منتشر شد`,
        time: new Date(a.date).toLocaleDateString('fa-IR')
      })),
      ...tools.slice(0, 2).map(t => ({
        icon: '🔧',
        text: `ابزار "${t.name}" اضافه شد`,
        time: new Date(t.date).toLocaleDateString('fa-IR')
      }))
    ];
    
    const activityHTML = activities.map(a => `
      <div class="activity-item">
        <div class="activity-icon">${a.icon}</div>
        <div class="activity-content">
          <p>${a.text}</p>
          <span class="activity-time">${a.time}</span>
        </div>
      </div>
    `).join('');
    
    document.getElementById('recentActivity').innerHTML = activityHTML || '<p style="color: var(--muted); text-align: center;">فعالیتی وجود ندارد</p>';
  } catch (error) {
    console.error('Error loading dashboard:', error);
  }
}

// Articles
document.getElementById('articleForm')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const articleData = {
    title: document.getElementById('articleTitle').value,
    excerpt: document.getElementById('articleExcerpt').value,
    content: document.getElementById('articleContent').value,
    category: document.getElementById('articleCategory').value,
    author: document.getElementById('articleAuthor').value,
    tags: document.getElementById('articleTags').value.split(',').map(t => t.trim()).filter(t => t),
    image: document.getElementById('articleImage').value,
    published: document.getElementById('articlePublished').checked
  };
  
  try {
    await createArticle(articleData);
    showAlert('articleAlert', 'مقاله با موفقیت منتشر شد!', 'success');
    document.getElementById('articleForm').reset();
    loadArticles();
  } catch (error) {
    showAlert('articleAlert', 'خطا در انتشار مقاله', 'error');
  }
});

async function loadArticles() {
  const articles = await getArticles();
  const container = document.getElementById('articlesList');
  document.getElementById('articlesTotal').textContent = articles.length;
  
  if (articles.length === 0) {
    container.innerHTML = '<p style="color: var(--muted); text-align: center;">هیچ مقاله‌ای وجود ندارد</p>';
    return;
  }
  
  container.innerHTML = articles.map(article => `
    <div class="item-card">
      <div class="item-info">
        <h4>${article.title}</h4>
        <p>${new Date(article.date).toLocaleDateString('fa-IR')} • ${article.category} • ${article.views || 0} بازدید</p>
      </div>
      <div class="item-actions">
        <button class="btn btn-sm btn-ghost" onclick="editArticle('${article.id}')">ویرایش</button>
        <button class="btn btn-sm btn-ghost" onclick="deleteArticleConfirm('${article.id}')">حذف</button>
      </div>
    </div>
  `).join('');
}

window.deleteArticleConfirm = async function(id) {
  if (confirm('آیا مطمئن هستید؟')) {
    await deleteArticle(id);
    loadArticles();
    loadDashboard();
  }
};

// Tools
document.getElementById('toolForm')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const toolData = {
    name: document.getElementById('toolName').value,
    description: document.getElementById('toolDescription').value,
    category: document.getElementById('toolCategory').value,
    icon: document.getElementById('toolIcon').value || '🔧',
    link: document.getElementById('toolLink').value,
  };
  
  try {
    const response = await fetch('/api/tools', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(toolData)
    });
    
    if (response.ok) {
      showAlert('toolAlert', 'ابزار با موفقیت اضافه شد!', 'success');
      document.getElementById('toolForm').reset();
      loadTools();
    }
  } catch (error) {
    showAlert('toolAlert', 'خطا در افزودن ابزار', 'error');
  }
});

async function loadTools() {
  try {
    const response = await fetch('/api/tools');
    const tools = await response.json();
    const container = document.getElementById('toolsList');
    document.getElementById('toolsTotal').textContent = tools.length;
    
    if (tools.length === 0) {
      container.innerHTML = '<p style="color: var(--muted); text-align: center;">هیچ ابزاری وجود ندارد</p>';
      return;
    }
    
    container.innerHTML = tools.map(tool => `
      <div class="item-card">
        <div class="item-info">
          <h4>${tool.icon} ${tool.name}</h4>
          <p>${tool.category}</p>
        </div>
        <div class="item-actions">
          <button class="btn btn-sm btn-ghost" onclick="deleteTool('${tool.id}')">حذف</button>
        </div>
      </div>
    `).join('');
  } catch (error) {
    console.error('Error loading tools:', error);
  }
}

// File Upload
const uploadArea = document.getElementById('uploadArea');
const fileInput = document.getElementById('fileInput');

uploadArea?.addEventListener('click', () => fileInput.click());

uploadArea?.addEventListener('dragover', (e) => {
  e.preventDefault();
  uploadArea.classList.add('dragover');
});

uploadArea?.addEventListener('dragleave', () => {
  uploadArea.classList.remove('dragover');
});

uploadArea?.addEventListener('drop', (e) => {
  e.preventDefault();
  uploadArea.classList.remove('dragover');
  handleFiles(e.dataTransfer.files);
});

fileInput?.addEventListener('change', (e) => {
  handleFiles(e.target.files);
});

async function handleFiles(files) {
  for (const file of files) {
    if (file.size > 25 * 1024 * 1024) {
      showAlert('uploadAlert', `فایل ${file.name} بیش از 25MB است`, 'error');
      continue;
    }
    await uploadFile(file);
  }
}

async function uploadFile(file) {
  const formData = new FormData();
  formData.append('file', file);
  
  const progressEl = document.getElementById('uploadProgress');
  const fillEl = document.getElementById('progressFill');
  const textEl = document.getElementById('progressText');
  
  progressEl.style.display = 'block';
  
  try {
    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData
    });
    
    const data = await response.json();
    
    if (data.success) {
      fillEl.style.width = '100%';
      textEl.textContent = 'آپلود موفق!';
      showAlert('uploadAlert', `فایل ${file.name} با موفقیت آپلود شد!`, 'success');
      setTimeout(() => {
        progressEl.style.display = 'none';
        fillEl.style.width = '0%';
      }, 2000);
      loadFiles();
    }
  } catch (error) {
    showAlert('uploadAlert', `خطا در آپلود ${file.name}`, 'error');
    progressEl.style.display = 'none';
  }
}

async function loadFiles() {
  try {
    const response = await fetch('/api/files');
    const files = await response.json();
    const container = document.getElementById('filesList');
    
    if (files.length === 0) {
      container.innerHTML = '<p style="color: var(--muted); text-align: center; grid-column: 1/-1;">هیچ فایلی آپلود نشده</p>';
      return;
    }
    
    container.innerHTML = files.map(file => `
      <div class="file-card">
        <div class="file-icon">${getFileIcon(file.name)}</div>
        <div class="file-name">${file.name}</div>
        <div class="file-size">${formatFileSize(file.size)}</div>
        <div class="file-actions">
          <button class="btn btn-sm btn-ghost" onclick="copyFileLink('${file.url}')">کپی لینک</button>
          <button class="btn btn-sm btn-ghost" onclick="deleteFile('${file.id}')">حذف</button>
        </div>
      </div>
    `).join('');
  } catch (error) {
    console.error('Error loading files:', error);
  }
}

function getFileIcon(filename) {
  const ext = filename.split('.').pop().toLowerCase();
  const icons = {
    'jpg': '🖼️', 'jpeg': '🖼️', 'png': '🖼️', 'gif': '🖼️',
    'pdf': '📄', 'doc': '📝', 'docx': '📝',
    'zip': '📦', 'rar': '📦',
    'mp3': '🎵', 'mp4': '🎬'
  };
  return icons[ext] || '📄';
}

function formatFileSize(bytes) {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

window.copyFileLink = function(url) {
  navigator.clipboard.writeText(window.location.origin + url);
  showAlert('uploadAlert', 'لینک کپی شد!', 'success');
  setTimeout(() => document.getElementById('uploadAlert').innerHTML = '', 2000);
};

// Templates
function loadTemplates() {
  const container = document.getElementById('templatesGrid');
  
  const allTemplates = [
    ...templates.articles.map(t => ({...t, type: 'article'})),
    ...templates.tools.map(t => ({...t, type: 'tool'}))
  ];
  
  container.innerHTML = allTemplates.map((template, index) => `
    <div class="template-card" onclick="applyTemplate('${template.type}', ${index})">
      <div class="template-header">
        <div class="template-icon">${template.icon}</div>
        <h3>${template.title}</h3>
      </div>
      <p>${template.description}</p>
      <div class="template-tags">
        ${template.tags.map(tag => `<span class="template-tag">${tag}</span>`).join('')}
      </div>
    </div>
  `).join('');
}

window.applyTemplate = function(type, index) {
  const template = type === 'article' ? templates.articles[index] : templates.tools[index];
  
  if (type === 'article') {
    document.getElementById('articleTitle').value = template.content.title;
    document.getElementById('articleExcerpt').value = template.content.excerpt;
    document.getElementById('articleContent').value = template.content.content;
    document.getElementById('articleCategory').value = template.content.category;
    document.getElementById('articleTags').value = template.content.tags;
    switchTab('articles');
  } else {
    document.getElementById('toolName').value = template.content.name;
    document.getElementById('toolDescription').value = template.content.description;
    document.getElementById('toolCategory').value = template.content.category;
    document.getElementById('toolIcon').value = template.content.icon;
    document.getElementById('toolLink').value = template.content.link;
    switchTab('tools');
  }
  
  showAlert(type === 'article' ? 'articleAlert' : 'toolAlert', 'تمپلیت اعمال شد!', 'success');
};

window.useTemplate = function(type) {
  switchTab('templates');
};

// Settings
async function loadSettings() {
  try {
    const response = await fetch('/api/admin/env-info');
    const data = await response.json();
    
    if (data.username) {
      document.getElementById('envUsername').textContent = data.username;
    }
    if (data.kvNamespace) {
      document.getElementById('kvNamespace').textContent = data.kvNamespace;
    }
  } catch (error) {
    console.error('Error loading settings:', error);
  }
}

window.clearCache = function() {
  if (confirm('آیا مطمئن هستید؟')) {
    localStorage.clear();
    sessionStorage.clear();
    alert('کش پاک شد!');
  }
};

window.exportData = async function() {
  try {
    const articles = await getArticles();
    const toolsRes = await fetch('/api/tools');
    const tools = await toolsRes.json();
    
    const data = { articles, tools, exportDate: new Date().toISOString() };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `backup-${Date.now()}.json`;
    a.click();
  } catch (error) {
    alert('خطا در دانلود بکاپ');
  }
};

window.refreshData = function() {
  const icon = document.getElementById('refreshIcon');
  icon.style.animation = 'spin 1s linear';
  setTimeout(() => icon.style.animation = '', 1000);
  
  loadDashboard();
  loadArticles();
  loadTools();
  loadFiles();
  checkSystemStatus();
};

// Helper
function showAlert(elementId, message, type) {
  const element = document.getElementById(elementId);
  element.innerHTML = `<div class="alert alert-${type}">${message}</div>`;
  setTimeout(() => element.innerHTML = '', 5000);
}

// Initialize
checkAuth();
