// payment-simple.js с работающим CORS прокси
const SHOP_ID = '1194993';
const SECRET_KEY = 'live_1w7Bjx1zewKyJ3-CUmjMuAv0eY_x9dI8byOmEuMibes';

async function createSimplePayment(productId, productName, price) {
    const buyButton = event.target;
    const originalText = buyButton.textContent;
    
    try {
        buyButton.textContent = 'Подождите...';
        buyButton.disabled = true;

        console.log('🔄 Создаем платеж для:', productName);

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

        // Используем РАБОЧИЙ CORS прокси
        const proxyUrl = 'https://api.codetabs.com/v1/proxy?quest=';
        const targetUrl = 'https://api.yookassa.ru/v3/payments';

        console.log('📤 Отправляем запрос через прокси...');

        const response = await fetch(proxyUrl + targetUrl, {
            method: 'POST',
            headers: {
                'Authorization': 'Basic ' + btoa(SHOP_ID + ':' + SECRET_KEY),
                'Idempotence-Key': 'key-' + Date.now() + '-' + Math.random().toString(36),
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(paymentData)
        });

        console.log('✅ Получили ответ, статус:', response.status);

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`HTTP ${response.status}: ${errorText}`);
        }

        const result = await response.json();
        console.log('📦 Ответ ЮKassa:', result);

        if (result.confirmation && result.confirmation.confirmation_url) {
            console.log('🎉 Успех! Переходим к оплате...');
            window.location.href = result.confirmation.confirmation_url;
        } else {
            throw new Error(result.description || 'Не получили ссылку для оплаты');
        }

    } catch (error) {
        console.error('❌ Ошибка платежа:', error);
        alert('Ошибка платежа: ' + error.message + '\n\nПопробуйте обновить страницу и повторить.');
    } finally {
        buyButton.textContent = originalText;
        buyButton.disabled = false;
    }
}
