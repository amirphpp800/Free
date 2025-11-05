// Get all files list

export async function onRequestGet(context) {
  try {
    const { DB } = context.env;
    const list = await DB.list({ prefix: 'file:' });
    const files = [];

    for (const key of list.keys) {
      const metadata = key.metadata || {};
      files.push({
        id: key.name.replace('file:', ''),
        name: metadata.filename || key.name,
        size: metadata.size || 0,
        type: metadata.type || 'unknown',
        date: metadata.uploadDate || new Date().toISOString(),
        url: `/api/files/${key.name.replace('file:', '')}`
      });
    }

    // Sort by date
    files.sort((a, b) => new Date(b.date) - new Date(a.date));

    return new Response(JSON.stringify(files), {
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
    const fileId = url.searchParams.get('id');

    if (!fileId) {
      return new Response(JSON.stringify({ error: 'ID فایل الزامی است' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json; charset=utf-8' }
      });
    }

    await DB.delete(`file:${fileId}`);

    return new Response(JSON.stringify({ 
      success: true, 
      message: 'فایل حذف شد'
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
