import { Telegraf } from 'telegraf';

const bot = new Telegraf(process.env.BOT_TOKEN);
const balances = new Map();

bot.start((ctx) => {
  ctx.reply('✅ DCL Bot ready\nUse: /add <name> <amount>');
});

bot.command('add', (ctx) => {
  const parts = ctx.message.text.split(' ');
  const name = parts[1];
  const amount = parts[2];
  if (!name ||!amount) return ctx.reply('Usage: /add james 10');
  const val = (balances.get(name) || 0) + Number(amount);
  balances.set(name, val);
  ctx.reply(`✅ Added ${amount} boosts to ${name}`);
});

bot.command('balance', (ctx) => {
  const name = ctx.message.text.split(' ')[1];
  if (!name) return ctx.reply('Usage: /balance james');
  ctx.reply(`${name}: ${balances.get(name) || 0}`);
});

export default async function handler(req, res) {
  if (req.method!== 'POST') return res.status(200).send('OK');
  try {
    await bot.handleUpdate(req.body);
  } catch (e) {
    console.error('Bot error', e);
  }
  res.status(200).send('OK');
}
