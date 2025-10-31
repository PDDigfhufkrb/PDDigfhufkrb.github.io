module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  console.log('Получен запрос на создание платежа');
  
  // Тестовый ответ
  res.status(200).json({
    success: true,
    payment_url: 'https://yookassa.ru/test-payment'
  });
};
