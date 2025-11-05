// API endpoint برای مدیریت ابزارها

export async function onRequestGet(context) {
  try {
    const { DB } = context.env;
    const list = await DB.list({ prefix: 'tool:' });
    const tools = [];

    for (const key of list.keys) {
      const tool = await DB.get(key.name, { type: 'json' });
      if (tool) tools.push(tool);
    }

    return new Response(JSON.stringify(tools), {
      headers: { 'Content-Type': 'application/json; charset=utf-8' }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json; charset=utf-8' }
    });
  }
}

export async function onRequestPost(context) {
  try {
    const { DB } = context.env;
    const tool = await context.request.json();
    const toolId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    const toolData = {
      id: toolId,
      name: tool.name,
      description: tool.description || '',
      category: tool.category || 'other',
      icon: tool.icon || '🔧',
      link: tool.link || '',
      date: new Date().toISOString()
    };

    await DB.put(`tool:${toolId}`, JSON.stringify(toolData));

    return new Response(JSON.stringify({ success: true, toolId }), {
      status: 201,
      headers: { 'Content-Type': 'application/json; charset=utf-8' }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json; charset=utf-8' }
    });
  }
}
