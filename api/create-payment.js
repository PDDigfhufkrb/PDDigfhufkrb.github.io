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

    // Формируем данные для платежа согласно API ЮKassa
    const paymentData = {
      amount: {
        value: price.toFixed(2), // Обязательно 2 знака после запятой
        currency: "RUB"
      },
      capture: true, // Мгновенное списание
      confirmation: {
        type: "redirect",
        return_url: `${SITE_URL}/success.html?product=${productId}`
      },
      description: productName.substring(0, 128), // Максимум 128 символов
      metadata: {
        product_id: productId
      }
    };

    // Генерируем уникальный ключ идемпотентности
    const idempotenceKey = `key-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // Создаем Basic Auth заголовок
    const authString = Buffer.from(SHOP_ID + ':' + SECRET_KEY).toString('base64');

    // Отправляем запрос к API ЮKassa
    const response = await fetch('https://api.yookassa.ru/v3/payments', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${authString}`,
        'Idempotence-Key': idempotenceKey,
        'Content-Type': 'application/json',
        'User-Agent': 'PDD-Shop/1.0'
      },
      body: JSON.stringify(paymentData)
    });

    // Проверяем статус ответа
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    const payment = await response.json();

    // Проверяем ответ от ЮKassa
    if (payment.error) {
      throw new Error(payment.description || 'Payment creation failed');
    }

    if (!payment.confirmation || !payment.confirmation.confirmation_url) {
      throw new Error('No confirmation URL received from payment gateway');
    }

    // Возвращаем успешный ответ
    res.status(200).json({
      success: true,
      payment_id: payment.id,
      confirmation_url: payment.confirmation.confirmation_url,
      status: payment.status
    });

  } catch (error) {
    console.error('Payment API error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Internal server error',
      code: 'PAYMENT_CREATION_FAILED'
    });
  }
};
