// File Upload API

export async function onRequestPost(context) {
  try {
    const formData = await context.request.formData();
    const file = formData.get('file');
    
    if (!file) {
      return new Response(JSON.stringify({ error: 'فایلی انتخاب نشده' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json; charset=utf-8' }
      });
    }

    const { DB } = context.env;
    const fileId = `${Date.now()}-${file.name}`;
    const arrayBuffer = await file.arrayBuffer();
    
    // ذخیره فایل در KV
    await DB.put(`file:${fileId}`, arrayBuffer, {
      metadata: {
        filename: file.name,
        type: file.type,
        size: file.size,
        uploadDate: new Date().toISOString()
      }
    });

    const fileUrl = `/api/files/${fileId}`;

    return new Response(JSON.stringify({
      success: true,
      url: fileUrl,
      filename: file.name
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
