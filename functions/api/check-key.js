export async function onRequestPost(context) {
  const { request, env } = context;

  try {
    const { key, hwid } = await request.json();

    if (!key) return json({ valid: false, message: 'Thiếu key' });

    const raw = await env.KV.get('key:' + key);
    if (!raw) return json({ valid: false, message: 'Key không tồn tại' });

    const data = JSON.parse(raw);

    if (!data.active) return json({ valid: false, message: 'Key đã bị khóa' });

    if (data.expire > 0 && Date.now() > data.expire)
      return json({ valid: false, message: 'Key đã hết hạn', expired: true });

    if (hwid && data.hwid && data.hwid !== hwid && data.activated)
      return json({ valid: false, message: 'Key đã dùng cho máy khác' });

    if (hwid && !data.activated) {
      data.hwid = hwid;
      data.activated = true;
      data.activatedAt = Date.now();
      await env.KV.put('key:' + key, JSON.stringify(data));
    }

    return json({
      valid: true,
      message: 'Key hợp lệ',
      expire: data.expire,
      type: data.type
    });

  } catch (e) {
    return json({ valid: false, message: e.message });
  }
}

function json(obj) {
  return new Response(JSON.stringify(obj), {
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    }
  });
}