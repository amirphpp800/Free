// Admin route handler with authentication check

export async function onRequest(context) {
  const url = new URL(context.request.url);
  const path = context.params.path ? context.params.path.join('/') : '';
  
  // Check if user is authenticated
  const cookie = context.request.headers.get('Cookie') || '';
  const isAuthenticated = cookie.includes('admin_token=');
  
  // Login page - always accessible
  if (!path || path === '' || path === 'login') {
    return context.env.ASSETS.fetch(new Request(`${url.origin}/admin/index.html`, context.request));
  }
  
  // Protected routes - require authentication
  if (!isAuthenticated) {
    return new Response(null, {
      status: 302,
      headers: {
        'Location': '/admin/login'
      }
    });
  }
  
  // Serve admin assets
  return context.env.ASSETS.fetch(context.request);
}
