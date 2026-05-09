export default async function handler(req, res) {
  const TOKEN = process.env.TELEGRAM_BOT_TOKEN;
  
  if (req.method !== 'POST') return res.status(200).send('OK');
  
  const msg = req.body?.message;
  console.log("FULL UPDATE:", JSON.stringify(req.body)); // <-- this prints the ID

  if (!msg?.text) return res.status(200).send('OK');

  const chatId = msg.chat.id;
  const text = msg.text;

  // reply with the ID for any /id
  if (text.startsWith('/id')) {
    await fetch(`https://api.telegram.org/bot${TOKEN}/sendMessage`, {
      method: 'POST',
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify({chat_id: chatId, text: `Chat ID: ${chatId}`})
    });
  }
  return res.status(200).send('OK');
}
