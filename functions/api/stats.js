// API endpoint برای آمار و بازدیدها

export async function onRequestGet(context) {
  try {
    const { DB } = context.env;
    const url = new URL(context.request.url);
    const type = url.searchParams.get('type') || 'all';

    if (type === 'views') {
      // دریافت آمار بازدید
      const articleId = url.searchParams.get('id');
      if (articleId) {
        const views = await DB.get(`views:${articleId}`) || '0';
        return new Response(JSON.stringify({ views: parseInt(views) }), {
          headers: { 'Content-Type': 'application/json; charset=utf-8' }
        });
      }
    }

    if (type === 'all') {
      // آمار کلی
      const articlesList = await DB.list({ prefix: 'article:' });
      const totalArticles = articlesList.keys.length;

      const stats = {
        totalArticles,
        lastUpdate: new Date().toISOString()
      };

      return new Response(JSON.stringify(stats), {
        headers: { 'Content-Type': 'application/json; charset=utf-8' }
      });
    }

    return new Response(JSON.stringify({ error: 'نوع آمار نامعتبر' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json; charset=utf-8' }
    });
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
    const { articleId, action } = await context.request.json();

    if (action === 'increment_view') {
      // افزایش بازدید
      const currentViews = await DB.get(`views:${articleId}`) || '0';
      const newViews = parseInt(currentViews) + 1;
      await DB.put(`views:${articleId}`, newViews.toString());

      return new Response(JSON.stringify({ 
        success: true, 
        views: newViews 
      }), {
        headers: { 'Content-Type': 'application/json; charset=utf-8' }
      });
    }

    return new Response(JSON.stringify({ error: 'عملیات نامعتبر' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json; charset=utf-8' }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json; charset=utf-8' }
    });
  }
}
