export default async function handler(req, res) {
  if (req.method!== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { txHash, boostId, amount } = req.body;

  if (!txHash ||!boostId) {
    return res.status(400).json({ error: 'Missing data' });
  }

  const BSCSCAN_KEY = process.env.BSCSCAN_KEY;
  const WALLET_ADDRESS = process.env.WALLET_ADDRESS?.toLowerCase();

  const BOOST_AMOUNTS = {
    '1': 0.0064,
    '2': 0.0128,
    '3': 0.0256,
    '4': 0.0512
  };

  const expectedAmount = BOOST_AMOUNTS[boostId];

  try {
    const url = `https://api.bscscan.com/api?module=proxy&action=eth_getTransactionByHash&txhash=${txHash}&apikey=${BSCSCAN_KEY}`;
    const response = await fetch(url);
    const data = await response.json();

    if (!data.result) {
      return res.status(400).json({ error: 'Transaction not found' });
    }

    const tx = data.result;
    const toAddress = tx.to?.toLowerCase();
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
        details: `Sent ${valueBNB} BNB, expected ${expectedAmount} BNB`
      });
    }

    return res.status(200).json({
      success: true,
      boostId,
      txHash,
      amount: valueBNB,
      verified: true
    });

  } catch (error) {
    return res.status(500).json({ error: 'Verification failed', details: error.message });
  }
}
