export async function onRequestGet(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const key = url.searchParams.get('key');

  if (!key) {
    return html('Missing key', 400);
  }

  const raw = await env.KV.get('key:' + key);
  if (!raw) return html(generateHTML('❌ KEY KHÔNG TỒN TẠI', null), 404);

  const data = JSON.parse(raw);

  if (!data.active)
    return html(generateHTML('⛔ KEY ĐÃ BỊ KHÓA', null), 403);

  return html(generateHTML('✅ KEY HỢP LỆ', key, data), 200);
}

function html(body, status) {
  return new Response(body, {
    status: status,
    headers: { 'Content-Type': 'text/html; charset=utf-8' }
  });
}

function generateHTML(title, key, data) {
  const expireText = !data ? '' :
    data.expire === 0 ? 'Vĩnh viễn' :
    new Date(data.expire).toLocaleString('vi-VN');

  const keyBlock = key ? `
    <div class="key-box">
      <div class="key-label">KEY CỦA BẠN:</div>
      <div class="key-value" id="keyValue">${key}</div>
      <button class="btn" onclick="copyKey()">📋 COPY KEY</button>
    </div>
    <div class="info">
      <p><b>HWID:</b> ${data.hwid ? data.hwid.substring(0, 16) + '...' : 'N/A'}</p>
      <p><b>Loại:</b> ${data.type}</p>
      <p><b>Hết hạn:</b> ${expireText}</p>
    </div>
  ` : '';

  return `<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>DungProxy Key System</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: linear-gradient(135deg, #0a0612 0%, #1a0a2e 100%);
      color: #fff;
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
    }
    .container {
      background: #100a1e;
      border: 3px solid #7CF03C;
      border-radius: 20px;
      padding: 40px 30px;
      max-width: 420px;
      width: 100%;
      box-shadow: 0 0 40px rgba(124, 240, 60, 0.3);
    }
    .logo { text-align: center; font-size: 48px; margin-bottom: 10px; }
    h1 { text-align: center; color: #7CF03C; font-size: 22px; margin-bottom: 30px; letter-spacing: 1px; }
    .key-box { background: #1a0a2e; border: 2px solid #7CF03C; border-radius: 12px; padding: 25px; margin: 20px 0; text-align: center; }
    .key-label { font-size: 12px; color: #8B8FA8; letter-spacing: 2px; margin-bottom: 12px; }
    .key-value { font-family: 'Courier New', monospace; font-size: 18px; font-weight: bold; color: #fff; background: #0a0612; padding: 15px; border-radius: 8px; word-break: break-all; margin-bottom: 15px; border: 1px dashed #7CF03C; }
    .btn { background: linear-gradient(135deg, #7CF03C, #4CAF50); color: #000; border: none; padding: 15px 30px; border-radius: 10px; font-size: 15px; font-weight: bold; cursor: pointer; width: 100%; }
    .btn:active { transform: scale(0.96); }
    .info { background: #1a0a2e; border-radius: 10px; padding: 15px; font-size: 12px; color: #8B8FA8; line-height: 1.8; }
    .info b { color: #7CF03C; }
    .footer { text-align: center; margin-top: 20px; font-size: 11px; color: #555577; }
  </style>
</head>
<body>
  <div class="container">
    <div class="logo">🔐</div>
    <h1>${title}</h1>
    ${keyBlock}
    <div class="footer">[ DungProxy Key System ]</div>
  </div>
  <script>
    function copyKey() {
      const key = document.getElementById('keyValue').innerText;
      navigator.clipboard.writeText(key).then(() => {
        alert('✅ Đã copy key: ' + key);
      });
    }
  </script>
</body>
</html>`;
}