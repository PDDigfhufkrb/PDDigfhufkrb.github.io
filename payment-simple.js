// payment-simple.js - ПРОСТО И РАБОЧЕ!
const SHOP_ID = '1194993';
const SECRET_KEY = 'live_1w7Bjx1zewKyJ3-CUmjMuAv0eY_x9dI8byOmEuMibes';

async function createSimplePayment(productId, productName, price) {
    const buyButton = event.target;
    const originalText = buyButton.textContent;
    
    try {
        buyButton.textContent = 'Подождите...';
        buyButton.disabled = true;

        console.log('Начинаем платеж...', { productId, productName, price });

        const paymentData = {
            amount: { 
                value: price.toString(), 
                currency: "RUB" 
            },
            capture: true,
            confirmation: {
                type: "redirect", 
                return_url: window.location.origin + "/success.html?product=" + productId
            },
            description: productName
        };

        console.log('Отправляем данные в ЮKassa...');

        const response = await fetch('https://api.yookassa.ru/v3/payments', {
            method: 'POST',
            headers: {
                'Authorization': 'Basic ' + btoa(SHOP_ID + ':' + SECRET_KEY),
                'Idempotence-Key': 'key-' + Date.now() + '-' + Math.random(),
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(paymentData)
        });

        console.log('Получили ответ, статус:', response.status);

        if (!response.ok) {
            throw new Error('HTTP error: ' + response.status);
        }

        const result = await response.json();
        console.log('Ответ ЮKassa:', result);

        if (result.confirmation && result.confirmation.confirmation_url) {
            console.log('Переходим к оплате:', result.confirmation.confirmation_url);
            window.location.href = result.confirmation.confirmation_url;
        } else {
            throw new Error(result.description || 'Не получили ссылку для оплаты');
        }

    } catch (error) {
        console.error('Ошибка платежа:', error);
        alert('Ошибка: ' + error.message + '\n\nПроверь консоль (F12) для подробностей.');
    } finally {
        buyButton.textContent = originalText;
        buyButton.disabled = false;
    }
}
