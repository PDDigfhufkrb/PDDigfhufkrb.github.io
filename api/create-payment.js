async function buyProduct() {
    // ТЕСТОВЫЙ РЕЖИМ - безопасно
    const shopId = '123456'; // твой ShopID
    const secretKey = 'test_...'; // тестовый ключ из ЮKassы
    
    const auth = btoa(shopId + ':' + secretKey);
    
    const response = await fetch('https://api.yookassa.ru/v3/payments', {
        method: 'POST',
        headers: {
            'Authorization': 'Basic ' + auth,
            'Content-Type': 'application/json',
            'Idempotence-Key': Date.now().toString()
        },
        body: JSON.stringify({
            amount: { value: "99.00", currency: "RUB" },
            capture: true,
            confirmation: { 
                type: "redirect", 
                return_url: "https://pddigfhufkrb.github.io/index.html"
            },
            description: "Шпаргалка ПДД: Основные понятия"
        })
    });
    
    const payment = await response.json();
    window.location.href = payment.confirmation.confirmation_url;
}
