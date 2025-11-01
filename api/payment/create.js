export default async function handler(req, res) {
  console.log('🔄 API вызван! Данные:', req.body);
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { product_id, price, email } = req.body;
    
    console.log(`💳 Тестовый платеж: продукт ${product_id}, ${price} руб, email ${email}`);
    
    // ВРЕМЕННО: тестовый ответ пока ключ не активирован
    // Когда ключ заработает - вернем код с ЮKassa
    
    // Имитируем успешный платеж
    res.status(200).json({ 
      success: true, 
      payment_url: 'https://yookassa.ru/' // временная ссылка
    });

  } catch (error) {
    console.error('❌ Ошибка:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Временная ошибка. Ключ активируется через 48 часов.' 
    });
  }
}
