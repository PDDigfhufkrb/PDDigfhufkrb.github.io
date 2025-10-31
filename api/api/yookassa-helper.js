// Пока временная заглушка - функция будет работать без реального SDK
async function createYooKassaPayment(productId, email) {
  // Временная заглушка для тестирования
  return {
    id: 'test_payment_' + Date.now(),
    confirmation: {
      confirmation_url: 'https://yookassa.ru/test-payment'
    }
  };
}

module.exports = { createYooKassaPayment };
