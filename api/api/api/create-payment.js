const { createYooKassaPayment } = require('./yookassa-helper');

module.exports = async (req, res) => {
  // Разрешаем запросы с любого домена
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Если браузер проверяет CORS - сразу отвечаем
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Разрешаем только POST запросы
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { product_id, email } = req.body;
    
    console.log('Создаем платеж для:', { product_id, email });
    
    // Создаем платеж в ЮKasse
    const payment = await createYooKassaPayment(product_id, email);
    
    // Отправляем ссылку на оплату
    res.status(200).json({
      success: true,
      payment_url: payment.confirmation.confirmation_url
    });
    
  } catch (error) {
    console.error('Ошибка:', error);
    res.status(500).json({
      success: false,
      error: 'Не удалось создать платеж'
    });
  }
};
