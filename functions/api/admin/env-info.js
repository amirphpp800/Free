// Get Environment Info (Safe)

export async function onRequestGet(context) {
  try {
    // Only return safe, non-sensitive info
    const info = {
      username: context.env.ADMIN_USERNAME ? context.env.ADMIN_USERNAME.substring(0, 3) + '***' : 'not set',
      kvNamespace: context.env.DB ? 'Connected' : 'Not Connected',
      environment: context.env.ENVIRONMENT || 'production'
    };
    
    return new Response(JSON.stringify(info), {
      headers: { 'Content-Type': 'application/json; charset=utf-8' }
    });
  } catch (error) {
    return new Response(JSON.stringify({
      error: 'خطا در دریافت اطلاعات'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json; charset=utf-8' }
    });
  }
}
