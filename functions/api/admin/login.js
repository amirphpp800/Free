// Admin Login API

export async function onRequestPost(context) {
  try {
    const { username, password } = await context.request.json();
    
    // دریافت اطلاعات از environment variables
    const ADMIN_USERNAME = context.env.ADMIN_USERNAME || 'admin';
    const ADMIN_PASSWORD = context.env.ADMIN_PASSWORD || 'admin123';
    
    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
      // ایجاد توکن ساده (در production از JWT استفاده کنید)
      const token = btoa(`${username}:${Date.now()}`);
      
      return new Response(JSON.stringify({
        success: true,
        token,
        message: 'ورود موفقیت‌آمیز'
      }), {
        headers: { 
          'Content-Type': 'application/json; charset=utf-8',
          'Set-Cookie': `admin_token=${token}; Path=/; HttpOnly; SameSite=Strict; Max-Age=86400`
        }
      });
    } else {
      return new Response(JSON.stringify({
        success: false,
        message: 'نام کاربری یا رمز عبور اشتباه است'
      }), {
        status: 401,
        headers: { 'Content-Type': 'application/json; charset=utf-8' }
      });
    }
  } catch (error) {
    return new Response(JSON.stringify({
      success: false,
      message: 'خطا در پردازش درخواست'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json; charset=utf-8' }
    });
  }
}
