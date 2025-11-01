module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    const { product_id, product_name, price, email } = req.body;

    // Проверяем что переменные окружения загружены
    if (!process.env.SHOP_ID || !process.env.SECRET_KEY) {
      throw new Error('Не настроены переменные окружения');
    }

    console.log('ShopID:', process.env.SHOP_ID);
    console.log('Secret Key starts with:', process.env.SECRET_KEY.substring(0, 10) + '...');

    const authString = process.env.SHOP_ID + ':' + process.env.SECRET_KEY;
    const authBase64 = Buffer.from(authString).toString('base64');

    const paymentData = {
      amount: {
        value: price.toFixed(2),
        currency: "RUB"
      },
      capture: true,
      confirmation: {
        type: "redirect",
        return_url: "https://pddigfhufkrb.github.io/index.html"
      },
      description: `Шпаргалка ПДД: ${product_name}`
    };

    console.log('Отправляем запрос к ЮKasse:', JSON.stringify(paymentData));

    const response = await fetch('https://api.yookassa.ru/v3/payments', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${authBase64}`,
        'Content-Type': 'application/json',
        'Idempotence-Key': Date.now().toString()
      },
      body: JSON.stringify(paymentData)
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    const payment = await response.json();
    console.log('Ответ ЮKassы:', payment);

    if (payment.confirmation?.confirmation_url) {
      res.json({
        success: true,
        payment_url: payment.confirmation.confirmation_url
      });
    } else {
      throw new Error('Нет ссылки для оплаты в ответе');
    }

  } catch (error) {
    console.error('Ошибка:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};
