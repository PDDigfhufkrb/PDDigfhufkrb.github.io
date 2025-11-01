module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    const { product_id, product_name, price, email } = req.body;

    // ВСТАВЬ СЮДА СВОИ РЕАЛЬНЫЕ ДАННЫЕ
    const SHOP_ID = '123456'; // замени на свой ShopID
    const SECRET_KEY = 'live_xxxxxxx'; // замени на свой ключ

    const authString = SHOP_ID + ':' + SECRET_KEY;
    const authBase64 = Buffer.from(authString).toString('base64');

    const paymentData = {
      amount: {
        value: '99.00', // фиксированная цена
        currency: "RUB"
      },
      capture: true,
      confirmation: {
        type: "redirect", 
        return_url: "https://pddigfhufkrb.github.io/index.html"
      },
      description: `Шпаргалка ПДД: ${product_name}`
    };

    const response = await fetch('https://api.yookassa.ru/v3/payments', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${authBase64}`,
        'Content-Type': 'application/json',
        'Idempotence-Key': Date.now().toString()
      },
      body: JSON.stringify(paymentData)
    });

    const payment = await response.json();
    
    if (payment.confirmation?.confirmation_url) {
      res.json({
        success: true,
        payment_url: payment.confirmation.confirmation_url
      });
    } else {
      res.status(500).json({
        success: false,
        error: 'Ошибка: ' + (payment.description || 'Неизвестная ошибка')
      });
    }

  } catch (error) {
    res.status(500).json({
      success: false, 
      error: 'Ошибка сервера'
    });
  }
};
