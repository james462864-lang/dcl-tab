export default async function handler(req, res) {
  // Telegram only sends POST
  if (req.method !== 'POST') {
    return res.status(200).send('DCL bot alive');
  }

  const token = process.env.BOT_TOKEN || '';
  const targetGroup = process.env.TARGET_GROUP_ID || ''; // optional: put your channel/group ID here

  // Debug – you can remove this line later
  console.log('TOKEN CHECK:', token.slice(0,10), 'len', token.length);

  try {
    const update = req.body;
    const msg = update.message || update.edited_message || update.channel_post;
    if (!msg) return res.status(200).send('ok');

    const chatId = msg.chat.id;
    const text = (msg.text || '').trim();

    // /start command
    if (text === '/start') {
      await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text: 'DCL Bot ready ✅\n\nCommands:\n/start - wake up\n/help - help\n/alert <message> - send alert to group'
        })
      });
      return res.status(200).send('ok');
    }

    // /help command
    if (text === '/help') {
      await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text: 'Send /alert your message to broadcast to the DCL group.'
        })
      });
      return res.status(200).send('ok');
    }

    // /alert command – forwards to your group
    if (text.startsWith('/alert')) {
      const alertText = text.replace('/alert', '').trim() || 'Test alert from DCL';
      
      if (targetGroup) {
        await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: targetGroup,
            text: `🚨 DCL ALERT:\n${alertText}`
          })
        });
      }

      await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text: targetGroup ? 'Alert sent ✅' : 'Set TARGET_GROUP_ID in Vercel to enable broadcasting'
        })
      });
      return res.status(200).send('ok');
    }

    // Default echo
    await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: `You said: ${text}`
      })
    });

    res.status(200).send('ok');
  } catch (err) {
    console.error('FULL ERROR:', err);
    res.status(200).send('ok');
  }
}
