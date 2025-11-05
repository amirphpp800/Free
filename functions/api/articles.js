// API endpoint برای مدیریت مقالات
// استفاده از Cloudflare KV (DB)

export async function onRequestGet(context) {
  try {
    const { DB } = context.env;
    const url = new URL(context.request.url);
    const articleId = url.searchParams.get('id');

    if (articleId) {
      // دریافت یک مقاله خاص
      const article = await DB.get(`article:${articleId}`, { type: 'json' });
      
      if (!article) {
        return new Response(JSON.stringify({ error: 'مقاله یافت نشد' }), {
          status: 404,
          headers: { 'Content-Type': 'application/json; charset=utf-8' }
        });
      }

      return new Response(JSON.stringify(article), {
        headers: { 'Content-Type': 'application/json; charset=utf-8' }
      });
    } else {
      // دریافت لیست تمام مقالات
      const list = await DB.list({ prefix: 'article:' });
      const articles = [];

      for (const key of list.keys) {
        const article = await DB.get(key.name, { type: 'json' });
        if (article) {
          articles.push(article);
        }
      }

      // مرتب‌سازی بر اساس تاریخ
      articles.sort((a, b) => new Date(b.date) - new Date(a.date));

      return new Response(JSON.stringify(articles), {
        headers: { 'Content-Type': 'application/json; charset=utf-8' }
      });
    }
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json; charset=utf-8' }
    });
  }
}

export async function onRequestPost(context) {
  try {
    const { DB } = context.env;
    const article = await context.request.json();

    // ایجاد ID یکتا
    const articleId = article.id || `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    // ساختار مقاله
    const articleData = {
      id: articleId,
      title: article.title,
      content: article.content,
      excerpt: article.excerpt || '',
      category: article.category || 'عمومی',
      tags: article.tags || [],
      author: article.author || 'ابزارستان',
      date: article.date || new Date().toISOString(),
      image: article.image || '',
      views: article.views || 0,
      published: article.published !== false
    };

    // ذخیره در KV
    await DB.put(`article:${articleId}`, JSON.stringify(articleData));

    // به‌روزرسانی لیست مقالات
    await updateArticlesList(DB);

    return new Response(JSON.stringify({ 
      success: true, 
      articleId,
      message: 'مقاله با موفقیت ذخیره شد'
    }), {
      status: 201,
      headers: { 'Content-Type': 'application/json; charset=utf-8' }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json; charset=utf-8' }
    });
  }
}

export async function onRequestPut(context) {
  try {
    const { DB } = context.env;
    const url = new URL(context.request.url);
    const articleId = url.searchParams.get('id');

    if (!articleId) {
      return new Response(JSON.stringify({ error: 'ID مقاله الزامی است' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json; charset=utf-8' }
      });
    }

    const updates = await context.request.json();
    const existing = await DB.get(`article:${articleId}`, { type: 'json' });

    if (!existing) {
      return new Response(JSON.stringify({ error: 'مقاله یافت نشد' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json; charset=utf-8' }
      });
    }

    // به‌روزرسانی مقاله
    const updated = {
      ...existing,
      ...updates,
      id: articleId, // حفظ ID
      updatedAt: new Date().toISOString()
    };

    await DB.put(`article:${articleId}`, JSON.stringify(updated));
    await updateArticlesList(DB);

    return new Response(JSON.stringify({ 
      success: true, 
      message: 'مقاله به‌روزرسانی شد'
    }), {
      headers: { 'Content-Type': 'application/json; charset=utf-8' }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json; charset=utf-8' }
    });
  }
}

export async function onRequestDelete(context) {
  try {
    const { DB } = context.env;
    const url = new URL(context.request.url);
    const articleId = url.searchParams.get('id');

    if (!articleId) {
      return new Response(JSON.stringify({ error: 'ID مقاله الزامی است' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json; charset=utf-8' }
      });
    }

    await DB.delete(`article:${articleId}`);
    await updateArticlesList(DB);

    return new Response(JSON.stringify({ 
      success: true, 
      message: 'مقاله حذف شد'
    }), {
      headers: { 'Content-Type': 'application/json; charset=utf-8' }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json; charset=utf-8' }
    });
  }
}

// تابع کمکی برای به‌روزرسانی لیست مقالات
async function updateArticlesList(DB) {
  const list = await DB.list({ prefix: 'article:' });
  const articleIds = list.keys.map(key => key.name.replace('article:', ''));
  await DB.put('articles:list', JSON.stringify(articleIds));
}
