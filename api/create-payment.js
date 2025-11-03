const fetch = require('node-fetch');

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

    // Получаем ключи из переменных окружения Vercel
    const SHOP_ID = process.env.SHOP_ID;
    const SECRET_KEY = process.env.SECRET_KEY;
    const SITE_URL = process.env.SITE_URL;

    if (!SHOP_ID || !SECRET_KEY) {
      throw new Error('Payment keys not configured');
    }

    const paymentData = {
      amount: {
        value: price.toString(),
        currency: "RUB"
      },
      capture: true,
      confirmation: {
        type: "redirect",
        return_url: `${SITE_URL}/success.html?product=${productId}`
      },
      description: productName,
      metadata: {
        product_id: productId
      }
    };

    const response = await fetch('https://api.yookassa.ru/v3/payments', {
      method: 'POST',
      headers: {
        'Authorization': 'Basic ' + Buffer.from(SHOP_ID + ':' + SECRET_KEY).toString('base64'),
        'Idempotence-Key': 'key-' + Date.now() + '-' + Math.random().toString(36).substring(7),
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(paymentData)
    });

    const payment = await response.json();

    if (payment.error) {
      throw new Error(payment.description || 'Payment creation failed');
    }

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
      error: error.message || 'Internal server error'
    });
  }
};
