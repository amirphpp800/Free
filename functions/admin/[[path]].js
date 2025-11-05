// Admin route handler - serves admin pages
// Authentication is handled by _middleware.js

export async function onRequest(context) {
  const url = new URL(context.request.url);
  
  // Serve admin index.html for all /admin routes
  return context.env.ASSETS.fetch(new Request(`${url.origin}/admin/index.html`, context.request));
}
