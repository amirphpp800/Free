// Download file

export async function onRequestGet(context) {
  try {
    const { DB } = context.env;
    const fileId = context.params.id;
    
    const file = await DB.get(`file:${fileId}`, { type: 'arrayBuffer', cacheTtl: 3600 });
    const metadata = await DB.get(`file:${fileId}`, { type: 'json' });
    
    if (!file) {
      return new Response('File not found', { status: 404 });
    }

    return new Response(file, {
      headers: {
        'Content-Type': metadata?.type || 'application/octet-stream',
        'Content-Disposition': `attachment; filename="${metadata?.filename || fileId}"`,
        'Cache-Control': 'public, max-age=31536000'
      }
    });
  } catch (error) {
    return new Response('Error', { status: 500 });
  }
}
