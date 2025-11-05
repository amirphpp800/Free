// API Client برای ارتباط با Cloudflare Functions

const API_BASE = '/api';

// دریافت تمام مقالات
export async function getArticles() {
  try {
    const response = await fetch(`${API_BASE}/articles`);
    if (!response.ok) throw new Error('خطا در دریافت مقالات');
    return await response.json();
  } catch (error) {
    console.error('Error fetching articles:', error);
    return [];
  }
}

// دریافت یک مقاله
export async function getArticle(id) {
  try {
    const response = await fetch(`${API_BASE}/articles?id=${id}`);
    if (!response.ok) throw new Error('مقاله یافت نشد');
    return await response.json();
  } catch (error) {
    console.error('Error fetching article:', error);
    return null;
  }
}

// ایجاد مقاله جدید
export async function createArticle(articleData) {
  try {
    const response = await fetch(`${API_BASE}/articles`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(articleData)
    });
    if (!response.ok) throw new Error('خطا در ایجاد مقاله');
    return await response.json();
  } catch (error) {
    console.error('Error creating article:', error);
    throw error;
  }
}

// به‌روزرسانی مقاله
export async function updateArticle(id, updates) {
  try {
    const response = await fetch(`${API_BASE}/articles?id=${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updates)
    });
    if (!response.ok) throw new Error('خطا در به‌روزرسانی مقاله');
    return await response.json();
  } catch (error) {
    console.error('Error updating article:', error);
    throw error;
  }
}

// حذف مقاله
export async function deleteArticle(id) {
  try {
    const response = await fetch(`${API_BASE}/articles?id=${id}`, {
      method: 'DELETE'
    });
    if (!response.ok) throw new Error('خطا در حذف مقاله');
    return await response.json();
  } catch (error) {
    console.error('Error deleting article:', error);
    throw error;
  }
}

// افزایش بازدید
export async function incrementViews(articleId) {
  try {
    const response = await fetch(`${API_BASE}/stats`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        articleId, 
        action: 'increment_view' 
      })
    });
    if (!response.ok) throw new Error('خطا در ثبت بازدید');
    return await response.json();
  } catch (error) {
    console.error('Error incrementing views:', error);
    return null;
  }
}

// دریافت آمار
export async function getStats() {
  try {
    const response = await fetch(`${API_BASE}/stats?type=all`);
    if (!response.ok) throw new Error('خطا در دریافت آمار');
    return await response.json();
  } catch (error) {
    console.error('Error fetching stats:', error);
    return null;
  }
}

// ذخیره محلی (localStorage) برای کش
const CACHE_KEY = 'articles_cache';
const CACHE_DURATION = 5 * 60 * 1000; // 5 دقیقه

export function getCachedArticles() {
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (!cached) return null;

    const { data, timestamp } = JSON.parse(cached);
    if (Date.now() - timestamp > CACHE_DURATION) {
      localStorage.removeItem(CACHE_KEY);
      return null;
    }

    return data;
  } catch (error) {
    return null;
  }
}

export function setCachedArticles(articles) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({
      data: articles,
      timestamp: Date.now()
    }));
  } catch (error) {
    console.error('Error caching articles:', error);
  }
}
