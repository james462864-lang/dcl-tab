export default async function handler(req, res) {
  if (req.method!== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { txHash, boostId } = req.body;
  if (!txHash ||!boostId) {
    return res.status(400).json({ error: 'Missing data' });
  }

  const BSCSCAN_KEY = process.env.BSCSCAN_KEY;
  const WALLET_ADDRESS = process.env.WALLET_ADDRESS?.toLowerCase();
  const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
  const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

  const KV_URL = process.env.KV_REST_API_URL;
  const KV_TOKEN = process.env.KV_REST_API_TOKEN;

  const BOOST_AMOUNTS = {
    '1': 0.0064,
    '2': 0.0128,
    '3': 0.0256,
    '4': 0.0512
  };

  const expectedAmount = BOOST_AMOUNTS[boostId];

  try {
    // 1. Check if tx already used (KV)
    const checkUsed = await fetch(`${KV_URL}/get/tx:${txHash}`, {
      headers: { Authorization: `Bearer ${KV_TOKEN}` }
    });
    const used = await checkUsed.json();
    if (used.result) {
      return res.status(400).json({ error: 'Transaction already used' });
    }

    // 2. Verify on BSCScan
    const url = `https://api.bscscan.com/api?module=proxy&action=eth_getTransactionByHash&txhash=${txHash}&apikey=${BSCSCAN_KEY}`;
    const response = await fetch(url);
    const data = await response.json();

    if (!data.result) {
      return res.status(400).json({ error: 'Transaction not found' });
    }

    const tx = data.result;
    const toAddress = tx.to?.toLowerCase();
    const fromAddress = tx.from?.toLowerCase();
    const valueWei = parseInt(tx.value, 16);
    const valueBNB = valueWei / 1e18;

    if (toAddress!== WALLET_ADDRESS) {
      return res.status(400).json({
        error: 'Wrong wallet',
        details: `Payment sent to ${toAddress}, expected ${WALLET_ADDRESS}`
      });
    }

    const minAmount = expectedAmount * 0.98;
    if (valueBNB < minAmount) {
      return res.status(400).json({
        error: 'Insufficient amount',
        sent: valueBNB,
        expected: expectedAmount
      });
    }

    // 3. Save to KV (permanent)
    await fetch(`${KV_URL}/set/tx:${txHash}/1`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${KV_TOKEN}` }
    });

    const userKey = `boost:${fromAddress}`;
    const getCurrent = await fetch(`${KV_URL}/get/${userKey}`, {
      headers: { Authorization: `Bearer ${KV_TOKEN}` }
    });
    const { result } = await getCurrent.json();
    const current = Number(result) || 0;
    const newTotal = current + Number(boostId);

    await fetch(`${KV_URL}/set/${userKey}/${newTotal}`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${KV_TOKEN}` }
    });

    // 4. Notify Telegram
    await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: TELEGRAM_CHAT_ID,
        text: `🚀 BOOST VERIFIED!\nFrom: ${fromAddress}\nAmount: ${valueBNB} BNB\nBoost #${boostId}\nTotal boosts: ${newTotal}\nTx: ${txHash}`
      })
    });

    return res.json({
      success: true,
      totalBoosts: newTotal,
      from: fromAddress,
      amount: valueBNB
    });

  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
  }
