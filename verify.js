// api/verify.js - Secure BSC Verification
// Wallet locked on server - hackers cannot change it

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { hash, level, userId } = req.body;
    
    // ===== YOUR WALLET - LOCKED ON SERVER =====
    const WALLET = (process.env.WALLET_ADDRESS || '0x6CDA062a90cc9ea61e0Bb099De483610504944C9').toLowerCase();
    const BSC_KEY = process.env.BSCSCAN_KEY || 'YOUR_KEY_HERE';
    
    if (!hash?.match(/^0x[a-fA-F0-9]{64}$/)) {
      return res.status(400).json({ error: 'Invalid hash' });
    }

    const BOOSTS = {
      2: { bnb: 0.0128 },
      3: { bnb: 0.0255 },
      4: { bnb: 0.0383 },
      5: { bnb: 0.0638 }
    };

    const boost = BOOSTS[level];
    if (!boost) return res.status(400).json({ error: 'Invalid level' });

    // Check BSC
    const txRes = await fetch(`https://api.bscscan.com/api?module=proxy&action=eth_getTransactionByHash&txhash=${hash}&apikey=${BSC_KEY}`);
    const txData = await txRes.json();
    
    if (!txData.result) return res.status(400).json({ error: 'TX not found' });
    
    const tx = txData.result;
    const toAddr = (tx.to || '').toLowerCase();
    const valueBNB = Number(BigInt(tx.value || '0')) / 1e18;

    if (toAddr !== WALLET) {
      return res.status(400).json({ error: 'Wrong wallet', expected: WALLET });
    }
    
    if (valueBNB < boost.bnb * 0.98) {
      return res.status(400).json({ error: 'Low amount', sent: valueBNB, need: boost.bnb });
    }

    const rcRes = await fetch(`https://api.bscscan.com/api?module=proxy&action=eth_getTransactionReceipt&txhash=${hash}&apikey=${BSC_KEY}`);
    const rcData = await rcRes.json();
    
    if (!rcData.result || rcData.result.status !== '0x1') {
      return res.status(400).json({ error: 'TX failed' });
    }

    return res.status(200).json({
      success: true,
      level,
      perTap: level * 0.001,
      amount: valueBNB
    });

  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}