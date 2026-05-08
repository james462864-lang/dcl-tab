// /api/total.js - returns live boost count
export default async function handler(req, res) {
  const KV_URL = process.env.KV_REST_API_URL
  const KV_TOKEN = process.env.KV_REST_API_TOKEN

  const count = await fetch(`${KV_URL}/get/boost_count`, {
    headers: { Authorization: `Bearer ${KV_TOKEN}` }
  }).then(r => r.json())

  const total = count.result || 0
  
  return res.json({ 
    total: total,
    message: `🚀 Total boosts: ${total}`
  })
}
