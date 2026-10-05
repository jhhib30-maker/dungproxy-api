export async function onRequestPost(context) {
  const { request, env } = context;

  try {
    const { hwid, type } = await request.json();

    if (!hwid) return json({ error: 'Missing hwid' });

    const key = 'DUNG-' + Math.random().toString(36).substring(2, 18).toUpperCase();

    let expire = 0;
    if (type === '1day') expire = Date.now() + 24 * 60 * 60 * 1000;
    else if (type === '7day') expire = Date.now() + 7 * 24 * 60 * 60 * 1000;
    else if (type === '30day') expire = Date.now() + 30 * 24 * 60 * 60 * 1000;

    await env.KV.put('key:' + key, JSON.stringify({
      hwid: hwid,
      type: type || 'forever',
      expire: expire,
      created: Date.now(),
      active: true,
      activated: false
    }));

    // Tự nhận domain
    const url = new URL(request.url);
    const baseUrl = url.origin;

    const getKeyUrl = baseUrl + '/api/get-key?key=' + key;

    const VPLINK_API = '5b4b18cdf407fe7a582de5e171ff34384bc96e1d';
    const vplinkFull = 'https://vplink.in/api?api=' + VPLINK_API
      + '&url=' + encodeURIComponent(getKeyUrl);

    return json({
      success: true,
      key: key,
      getKeyUrl: getKeyUrl,
      vplinkUrl: vplinkFull,
      expire: expire,
      type: type || 'forever'
    });

  } catch (e) {
    return json({ error: e.message });
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
