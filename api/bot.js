export default async function handler(req, res) {
  const TOKEN = process.env.TELEGRAM_BOT_TOKEN;
  const TARGET = process.env.TARGET_GROUP_ID;
  const ADMIN = process.env.ADMIN_USER_ID;

  if (req.method !== 'POST') return res.status(200).send('OK');
  const msg = req.body?.message;
  if (!msg?.text) return res.status(200).send('OK');

  const chatId = msg.chat.id;
  const text = msg.text.trim();
  const fromId = String(msg.from.id);

  const send = (c, t) => fetch(`https://api.telegram.org/bot${TOKEN}/sendMessage`, {
    method: 'POST',
    headers: {'Content-Type':'application/json'},
    body: JSON.stringify({chat_id: c, text: t})
  });

  // NEW: reply with ID
  if (text === '/id' || text.startsWith('/id@')) {
    await send(chatId, `Chat ID: ${chatId}`);
    return res.status(200).send('OK');
  }

  // /alert command (only you)
  if (text.startsWith('/alert')) {
    if (fromId !== ADMIN) {
      await send(chatId, 'Not authorized');
      return res.status(200).send('OK');
    }
    const alertText = text.replace('/alert', '').trim() || 'Test';
    if (TARGET) await send(TARGET, `🚨 DCL ALERT: ${alertText}`);
    await send(chatId, 'Sent ✓');
    return res.status(200).send('OK');
  }

  await send(chatId, `You said: ${text}`);
  return res.status(200).send('OK');
}
