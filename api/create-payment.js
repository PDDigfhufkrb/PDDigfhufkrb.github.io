module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  // ВРЕМЕННО: тестовый платеж без реального API
  res.status(200).json({
    success: true,
    payment_url: 'https://yoomoney.ru/checkout/payments/v1/order?orderId=test123'
  });
};
