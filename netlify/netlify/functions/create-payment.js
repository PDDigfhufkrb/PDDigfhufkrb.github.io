const fetch = require('node-fetch');

exports.handler = async function(event, context) {
  // Разрешаем CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS'
  };

  // Обрабатываем preflight запрос
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: 'Method Not Allowed'
    };
  }

  try {
    const { amount, product_id, description } = JSON.parse(event.body);
    
    // Создаем платеж в ЮKassa
    const response = await fetch('https://api.yookassa.ru/v3/payments', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Basic ' + Buffer.from(process.env.YOOKASSA_SHOP_ID + ':' + process.env.YOOKASSA_SECRET_KEY).toString('base64'),
        'Idempotence-Key': Date.now().toString()
      },
      body: JSON.stringify({
        amount: {
          value: amount,
          currency: 'RUB'
        },
        capture: true,
        confirmation: {
          type: 'redirect',
          return_url: `${process.env.URL}/success.html?product=${product_id}`
        },
        description: description
      })
    });

    const paymentData = await response.json();

    if (!response.ok) {
      throw new Error(paymentData.description || 'Payment creation failed');
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        payment_url: paymentData.confirmation.confirmation_url
      })
    };

  } catch (error) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        error: error.message
      })
    };
  }
};
