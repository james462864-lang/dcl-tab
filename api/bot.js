import { Telegraf } from 'telegraf';
const token = process.env.BOT_TOKEN?.trim();
console.log('TOKEN CHECK:', token?.slice(0,10), 'len', token?.length);
const bot = new Telegraf(token);
const balances = new Map();
bot.start((ctx)=>ctx.reply('DCL Bot ready'));
bot.command('add',(ctx)=>{const p=ctx.message.text.split(' ');const n=p[1];const a=Number(p[2]);if(!n||!a)return ctx.reply('Usage: /add name 10');const v=(balances.get(n)||0)+a;balances.set(n,v);ctx.reply('Added '+a+' to '+n)});
bot.command('balance',(ctx)=>{const n=ctx.message.text.split(' ')[1];ctx.reply(n+': '+(balances.get(n)||0))});
export default async function handler(req,res){if(req.method!=='POST')return res.status(200).send('OK');try{await bot.handleUpdate(req.body)}catch(e){console.error('FULL ERROR:',e.message)}res.status(200).send('OK')}
