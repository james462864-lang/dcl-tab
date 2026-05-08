// /api/verify.js - NO API KEY NEEDED
export default async function handler(req, res) {
  const { txHash } = req.body

  const WALLET = "0x6CDA062a90cc9ea61e0Bb099De483610504944C9"
  const MIN_BOOST = 0.001
  const KV_URL = process.env.KV_REST_API_URL
  const KV_TOKEN = process.env.KV_REST_API_TOKEN
  const BSC_RPC = "https://bsc-dataseed.binance.org"

  // 1. Block duplicates
  const check = await fetch(`${KV_URL}/get/tx:${txHash}`, {
    headers: { Authorization: `Bearer ${KV_TOKEN}` }
  }).then(r => r.json())
  if (check.result) return res.json({ error: "Already counted" })

  // 2. Check real BNB transaction (no key needed)
  const tx = await fetch(BSC_RPC, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      jsonrpc: "2.0",
      id: 1,
      method: "eth_getTransactionByHash",
      params: [txHash]
    })
  }).then(r => r.json())

  if (!tx.result) return res.json({ error: "Tx not found" })
  if (tx.result.to.toLowerCase() !== WALLET.toLowerCase()) {
    return res.json({ error: "Wrong wallet" })
  }

  const valueBNB = parseInt(tx.result.value, 16) / 1e18
  if (valueBNB < MIN_BOOST) {
    return res.json({ error: `Need ${MIN_BOOST} BNB` })
  }

  // 3. Save and count
  await fetch(`${KV_URL}/set/tx:${txHash}/1`, {
    headers: { Authorization: `Bearer ${KV_TOKEN}` }
  })
  const count = await fetch(`${KV_URL}/incr/boost_count`, {
    headers: { Authorization: `Bearer ${KV_TOKEN}` }
  }).then(r => r.json())

  return res.json({ 
    success: true, 
    message: `🚀 BOOST VERIFIED! Total boosts: ${count.result}` 
  })
    }
