const YooKassa = require('yookassa');

export default async function handler(req, res) {
  // Разрешаем только POST запросы
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Получаем переменные окружения
    const { SHOP_ID, SECRET_KEY, SITE_URL } = process.env;
    
    // Проверяем наличие переменных
    if (!SHOP_ID || !SECRET_KEY || !SITE_URL) {
      console.error('Missing environment variables:', {
        SHOP_ID: SHOP_ID ? 'set' : 'missing',
        SECRET_KEY: SECRET_KEY ? 'set' : 'missing',
        SITE_URL: SITE_URL ? 'set' : 'missing'
      });
      return res.status(500).json({ 
        error: 'Server configuration error',
        details: 'Missing environment variables'
      });
    }

    const { amount, description, productId } = req.body;

    // Валидация входных данных
    if (!amount || !description) {
      return res.status(400).json({ 
        error: 'Missing required fields: amount, description' 
      });
    }

    // Инициализация ЮKassa
    const yooKassa = new YooKassa({
      shopId: SHOP_ID,
      secretKey: SECRET_KEY
    });

    // Создание платежа
    const payment = await yooKassa.createPayment({
      amount: {
        value: amount.toString(),
        currency: 'RUB'
      },
      payment_method_data: {
        type: 'bank_card'
      },
      confirmation: {
        type: 'redirect',
        return_url: `${SITE_URL}/success?product=${productId}`
      },
      description: description,
      metadata: {
        productId: productId
      }
    });

    // Возвращаем данные для редиректа
    return res.status(200).json({
      id: payment.id,
      confirmation_url: payment.confirmation.confirmation_url,
      status: payment.status
    });

  } catch (error) {
    console.error('Payment creation error:', error);
    return res.status(500).json({ 
      error: 'Payment creation failed',
      details: error.message 
    });
  }
}
