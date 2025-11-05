// Cloudflare Pages Functions Middleware
// دسترسی به KV از طریق context.env.DB

export async function onRequest(context) {
  const url = new URL(context.request.url);
  const pathname = url.pathname;

  // اضافه کردن CORS headers
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  // Handle CORS preflight
  if (context.request.method === 'OPTIONS') {
    return new Response(null, {
      headers: corsHeaders
    });
  }

  // Admin route protection
  if (pathname.startsWith('/admin')) {
    // Check authentication for admin routes (except login page)
    const cookie = context.request.headers.get('Cookie') || '';
    const isAuthenticated = cookie.includes('admin_token=');
    
    // Allow access to login page
    if (pathname === '/admin' || pathname === '/admin/') {
      // Serve admin login page
      return context.env.ASSETS.fetch(new Request(`${url.origin}/admin/index.html`, context.request));
    }
    
    // Protect other admin routes
    if (!isAuthenticated && !pathname.startsWith('/admin/admin.')) {
      return Response.redirect(`${url.origin}/admin`, 302);
    }
  }

  // ادامه به handler بعدی
  const response = await context.next();
  
  // اضافه کردن CORS headers به response
  Object.entries(corsHeaders).forEach(([key, value]) => {
    response.headers.set(key, value);
  });

  return response;
}
