async function createYooKassaPayment(productId, email) {
  // Временная заглушка для тестирования
  // Позже заменим на реальные HTTP запросы к API ЮKassы
  return {
    id: 'test_payment_' + Date.now(),
    confirmation: {
      confirmation_url: 'https://yookassa.ru/test-payment'
    }
  };
}

module.exports = { createYooKassaPayment };
