const fetch = require('node-fetch');

module.exports = async (req, res) => {
  // Разрешаем CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Обрабатываем preflight запрос
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Проверяем метод
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { productId, productName, price } = req.body;

    // Получаем ключи из environment variables
    const SHOP_ID = process.env.SHOP_ID;
    const SECRET_KEY = process.env.SECRET_KEY;
    const SITE_URL = process.env.SITE_URL;

    // Проверяем наличие обязательных переменных
    if (!SHOP_ID || !SECRET_KEY || !SITE_URL) {
      console.error('Missing environment variables:', {
        SHOP_ID: !!SHOP_ID,
        SECRET_KEY: !!SECRET_KEY,
        SITE_URL: !!SITE_URL
      });
      return res.status(500).json({ 
        error: 'Server configuration error',
        details: 'Missing environment variables'
      });
    }

    // Формируем данные для платежа по шаблону ЮKassa
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

    console.log('Creating payment with data:', {
      amount: paymentData.amount,
      description: paymentData.description
    });

    // Создаем уникальный ключ идемпотентности
    const idempotenceKey = `key-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // Отправляем запрос к API ЮKassa
    const response = await fetch('https://api.yookassa.ru/v3/payments', {
      method: 'POST',
      headers: {
        'Authorization': 'Basic ' + Buffer.from(SHOP_ID + ':' + SECRET_KEY).toString('base64'),
        'Idempotence-Key': idempotenceKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(paymentData)
    });

    // Проверяем статус ответа
    if (!response.ok) {
      const errorText = await response.text();
      console.error('YooKassa API error:', response.status, errorText);
      throw new Error(`Payment API error: ${response.status}`);
    }

    const payment = await response.json();
    console.log('Payment created:', payment.id);

    // Проверяем наличие confirmation_url
    if (!payment.confirmation || !payment.confirmation.confirmation_url) {
      throw new Error('No confirmation URL received from payment provider');
    }

    // Возвращаем успешный ответ
    res.status(200).json({
      success: true,
      payment_id: payment.id,
      confirmation_url: payment.confirmation.confirmation_url,
      status: payment.status
    });

  } catch (error) {
    console.error('Payment creation error:', error);
    
    // Возвращаем понятную ошибку
    res.status(500).json({
      success: false,
      error: 'Payment creation failed',
      message: error.message,
      details: 'Please try again or contact support'
    });
  }
};
