<?php
// Простой и рабочий процесс платежа
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json');

// Обрабатываем preflight
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    exit(0);
}

// Только POST запросы
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'error' => 'Method not allowed']);
    exit();
}

try {
    // Получаем данные
    $input = json_decode(file_get_contents('php://input'), true);
    
    $product_id = $input['productId'] ?? 'test';
    $product_name = $input['productName'] ?? 'Test Product';
    $price = $input['price'] ?? 99;

    // Твои ключи
    $shop_id = '1194993';
    $secret_key = 'live_1w7Bjx1zewKyJ3-CUmjMuAv0eY_x9dI8byOmEuMibes';

    // Данные для платежа
    $payment_data = [
        'amount' => [
            'value' => number_format($price, 2, '.', ''),
            'currency' => 'RUB'
        ],
        'capture' => true,
        'confirmation' => [
            'type' => 'redirect',
            'return_url' => 'https://pddshop.infinityfree.me/success.html?product=' . $product_id
        ],
        'description' => $product_name
    ];

    // Создаем запрос
    $ch = curl_init();
    curl_setopt_array($ch, [
        CURLOPT_URL => 'https://api.yookassa.ru/v3/payments',
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_POST => true,
        CURLOPT_POSTFIELDS => json_encode($payment_data),
        CURLOPT_HTTPHEADER => [
            'Authorization: Basic ' . base64_encode($shop_id . ':' . $secret_key),
            'Idempotence-Key: ' . uniqid(),
            'Content-Type: application/json'
        ],
        CURLOPT_TIMEOUT => 10
    ]);

    $response = curl_exec($ch);
    $http_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    $result = json_decode($response, true);

    if ($http_code === 200 && isset($result['confirmation']['confirmation_url'])) {
        echo json_encode([
            'success' => true,
            'confirmation_url' => $result['confirmation']['confirmation_url']
        ]);
    } else {
        throw new Exception($result['description'] ?? 'Payment failed');
    }

} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ]);
}
?>
