import YooKassa from 'yookassa';

const yooKassa = new YooKassa({
  shopId: process.env.YOOKASSA_SHOP_ID,
  secretKey: process.env.YOOKASSA_SECRET_KEY
});

export default async function handler(req, res) {
  console.log('🔄 API вызван! Данные:', req.body);
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { product_id, price, email } = req.body;

    console.log('💳 Создаем платеж в ЮKassa...');
    
    const payment = await yooKassa.createPayment({
      amount: {
        value: price,
        currency: 'RUB'
      },
      payment_method_data: {
        type: 'bank_card'
      },
      confirmation: {
        type: 'redirect',
        return_url: `${process.env.SITE_URL}/success.html`
      },
      capture: true,
      description: `PDD Shpargalka #${product_id}`,
      metadata: {
        product_id: product_id,
        email: email
      }
    });

    console.log('✅ Платеж создан:', payment.id);
    
    res.status(200).json({ 
      success: true, 
      payment_url: payment.confirmation.confirmation_url 
    });

  } catch (error) {
    console.error('❌ Ошибка ЮKassa:', error);
    
    // Детальная информация об ошибке
    let errorMessage = 'Payment error';
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    
    res.status(500).json({ 
      success: false, 
      error: errorMessage 
    });
  }
}
