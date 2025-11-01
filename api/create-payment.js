module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    const { product_id, product_name, price, email } = req.body;

    // Создаем базовую авторизацию
    const auth = Buffer.from(process.env.SHOP_ID + ':' + process.env.SECRET_KEY).toString('base64');

    const response = await fetch('https://api.yookassa.ru/v3/payments', {
      method: 'POST',
      headers: {
        'Authorization': 'Basic ' + auth,
        'Content-Type': 'application/json',
        'Idempotence-Key': Date.now().toString()
      },
      body: JSON.stringify({
        amount: { 
          value: price.toString(), 
          currency: 'RUB' 
        },
        capture: true,
        confirmation: { 
          type: 'redirect', 
          return_url: 'https://pddigfhufkrb.github.io/index.html' 
        },
        description: `Шпаргалка: ${product_name}`,
        metadata: { 
          product_id: product_id.toString(),
          email: email 
        }
      })
    });

    const payment = await response.json();
    
    if (payment.confirmation && payment.confirmation.confirmation_url) {
      res.status(200).json({
        success: true,
        payment_url: payment.confirmation.confirmation_url
      });
    } else {
      res.status(500).json({
        success: false,
        error: 'Ошибка ЮKassы: ' + (payment.description || JSON.stringify(payment))
      });
    }

  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Ошибка сервера: ' + error.message
    });
  }
};
