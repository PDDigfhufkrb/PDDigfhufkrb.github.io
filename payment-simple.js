// Альтернативная версия с другим прокси
const SHOP_ID = '1194993';
const SECRET_KEY = 'live_1w7Bjx1zewKyJ3-CUmjMuAv0eY_x9dI8byOmEuMibes';

async function createSimplePayment(productId, productName, price) {
    const buyButton = event.target;
    const originalText = buyButton.textContent;
    
    try {
        buyButton.textContent = 'Подождите...';
        buyButton.disabled = true;

        const paymentData = {
            amount: { value: price.toString(), currency: "RUB" },
            capture: true,
            confirmation: {
                type: "redirect", 
                return_url: window.location.origin + "/success.html?product=" + productId
            },
            description: productName
        };

        // Пробуем разные прокси по очереди
        const proxies = [
            'https://cors-anywhere.herokuapp.com/',
            'https://api.allorigins.win/raw?url=',
            'https://corsproxy.io/?'
        ];

        let lastError = null;

        for (const proxy of proxies) {
            try {
                console.log(`Пробуем прокси: ${proxy}`);
                
                const response = await fetch(proxy + 'https://api.yookassa.ru/v3/payments', {
                    method: 'POST',
                    headers: {
                        'Authorization': 'Basic ' + btoa(SHOP_ID + ':' + SECRET_KEY),
                        'Idempotence-Key': 'key-' + Date.now(),
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(paymentData)
                });

                if (response.ok) {
                    const result = await response.json();
                    if (result.confirmation && result.confirmation.confirmation_url) {
                        window.location.href = result.confirmation.confirmation_url;
                        return;
                    }
                }
            } catch (error) {
                lastError = error;
                console.log(`Прокси ${proxy} не сработал:`, error);
                continue;
            }
        }

        throw new Error('Все прокси не сработали: ' + (lastError?.message || 'Unknown error'));

    } catch (error) {
        console.error('Ошибка:', error);
        alert('Не удалось подключиться к платежной системе. Попробуйте позже.');
    } finally {
        buyButton.textContent = originalText;
        buyButton.disabled = false;
    }
}
