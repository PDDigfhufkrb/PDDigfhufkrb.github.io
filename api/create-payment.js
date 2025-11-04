const fetch = require('node-fetch');
const https = require('https');

module.exports = async (req, res) => {
  // Разрешаем CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { productId, productName, price } = req.body;
    const SHOP_ID = process.env.SHOP_ID;
    const SECRET_KEY = process.env.SECRET_KEY;
    const SITE_URL = process.env.SITE_URL;

    if (!SHOP_ID || !SECRET_KEY || !SITE_URL) {
      return res.status(500).json({ 
        error: 'Server configuration error'
      });
    }

    const paymentData = {
      amount: {
        value: price.toFixed(2),
        currency: "RUB"
      },
      capture: true,
      confirmation: {
        type: "redirect",
        return_url: `${SITE_URL}/success.html?product=${productId}`
      },
      description: productName
    };

    const idempotenceKey = `key-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // Исправленный запрос с игнорированием SSL
    const response = await fetch('https://api.yookassa.ru/v3/payments', {
      method: 'POST',
      headers: {
        'Authorization': 'Basic ' + Buffer.from(SHOP_ID + ':' + SECRET_KEY).toString('base64'),
        'Idempotence-Key': idempotenceKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(paymentData),
      agent: new https.Agent({
        rejectUnauthorized: false
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const payment = await response.json();

    if (!payment.confirmation || !payment.confirmation.confirmation_url) {
      throw new Error('No confirmation URL received');
    }

    res.status(200).json({
      success: true,
      payment_id: payment.id,
      confirmation_url: payment.confirmation.confirmation_url
    });

  } catch (error) {
    console.error('Payment error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};
