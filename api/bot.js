import { Telegraf } from 'telegraf'

const bot = new Telegraf(process.env.BOT_TOKEN)

// /boosts command
bot.command('boosts', async (ctx) => {
  try {
    const res = await fetch('https://dcl-tab.vercel.app/api/total')
    const data = await res.json()
    await ctx.reply(data.message || `🚀 Total boosts: ${data.total}`)
  } catch (err) {
    await ctx.reply('Error getting boosts')
  }
})

// /start command (optional)
bot.start((ctx) => ctx.reply('Send /boosts to see total boosts'))

export default async function handler(req, res) {
  try {
    await bot.handleUpdate(req.body)
  } catch (e) {
    console.log(e)
  }
  res.status(200).send('OK')
}
