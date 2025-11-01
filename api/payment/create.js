export default async function handler(req, res) {
  console.log('✅ API работает!');
  
  res.status(200).json({ 
    success: true, 
    payment_url: 'https://yookassa.ru/'
  });
}
