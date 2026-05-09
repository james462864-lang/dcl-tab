import { Telegraf } from 'telegraf';

const token = process.env.BOT_TOKEN?.trim();
console.log('TOKEN CHECK:', token?.slice(0,10), '... length:', token?.length);

const bot = new Telegraf(token);
const balances = new Map();

bot.start((ctx) => ctx.reply('✅ DCL Bot ready\nUse: /add <name> <amount>'));
bot.command('add', (ctx) => {
  const [, name, amount] = ctx.message.text.split(' ');
  if (!name ||!amount) return ctx.reply('Usage: /add james 10');
  const val = (balances.get(name)||0) + Number(amount);
  balances.set(name, val);
  ctx.reply(`✅ Added ${amount} boosts to ${name}`);
});
bot.command('balance', (ctx) => {
  const name = ctx.message.text.split(' ')[1];
  ctx.reply(`${name}: ${balances.get(name)||0}`);
});

export default async function handler(req, res) {
  if (req.method!== 'POST') return res.status(200).send('OK');
  try {
    await bot.handleUpdate(req.body);
  } catch (e) {
    console.error('FULL ERROR:', e.message);
  }
  res.status(200).send('OK');
}
