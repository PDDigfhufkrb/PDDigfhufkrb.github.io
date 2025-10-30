const YooKassa = require('yookassa');

// Функция будет использовать ключи из переменных окружения
async function createYooKassaPayment(productId, email) {
  // Пока заглушка - здесь будет реальная логика
  return {
    id: 'test_payment_' + Date.now(),
    confirmation: {
      confirmation_url: 'https://yookassa.ru/test-payment'
    }
  };
}

module.exports = { createYooKassaPayment };
