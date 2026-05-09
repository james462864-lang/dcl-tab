import { Telegraf } from 'telegraf';

const bot = new Telegraf(process.env.BOT_TOKEN); // MUST match Vercel env name

// add guard for GET
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(200).send('OK');
  try {
    await bot.handleUpdate(req.body);
    res.status(200).send('OK');
  } catch (e) {
    console.error(e);
    res.status(200).send('OK'); // always 200 to Telegram
  }
}
