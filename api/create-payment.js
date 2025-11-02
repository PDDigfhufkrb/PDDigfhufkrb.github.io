export default async function handler(req, res) {
  console.log('✅ API работает! Данные:', req.body);
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { product_id, price, email } = req.body;
    
    console.log(`💳 Тестовый платеж: продукт ${product_id}, ${price} руб, email ${email}`);
    
    // ВРЕМЕННЫЙ ОТВЕТ - пока ключ не активирован
    res.status(200).json({ 
      success: true, 
      payment_url: 'https://yookassa.ru/' 
    });

  } catch (error) {
    console.error('❌ Ошибка:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Ошибка сервера' 
    });
  }
}
