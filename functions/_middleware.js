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
    const cookie = context.request.headers.get('Cookie') || '';
    const isAuthenticated = cookie.includes('admin_token=');
    
    // Serve admin login page for /admin or /admin/
    if (pathname === '/admin' || pathname === '/admin/') {
      // Redirect to ensure trailing slash
      if (pathname === '/admin') {
        return Response.redirect(`${url.origin}/admin/`, 301);
      }
      // Continue to serve the admin page
    }
    
    // Protect admin assets (CSS, JS) - allow if accessing login page
    if (pathname.startsWith('/admin/admin.')) {
      // Allow CSS and JS files
    } else if (!isAuthenticated && pathname !== '/admin/') {
      // Redirect to login if not authenticated
      return Response.redirect(`${url.origin}/admin/`, 302);
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
