// Check Environment Variables

export async function onRequestGet(context) {
  try {
    const hasUsername = !!context.env.ADMIN_USERNAME;
    const hasPassword = !!context.env.ADMIN_PASSWORD;
    const hasKV = !!context.env.DB;
    
    const status = hasUsername && hasPassword && hasKV ? 'فعال' : 'ناقص';
    
    return new Response(JSON.stringify({
      status,
      checks: {
        username: hasUsername,
        password: hasPassword,
        kv: hasKV
      }
    }), {
      headers: { 'Content-Type': 'application/json; charset=utf-8' }
    });
  } catch (error) {
    return new Response(JSON.stringify({
      status: 'خطا',
      error: error.message
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json; charset=utf-8' }
    });
  }
}
