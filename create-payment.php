<?php
header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json');

$shopId = '1194993';
$secretKey = 'live_1w7Bjx1zewKyJ3-CUmjMuAv0eY_x9dI8byOmEuMibes';

$input = json_decode(file_get_contents('php://input'), true);
$productId = $input['product_id'];
$price = $input['price'];

$productNames = [
    1 => 'Основные понятия и термины',
    2 => 'Обгон и опережение',
    3 => 'Остановка и стоянка',
    4 => 'Проезд перекрестков',
    5 => 'Скоростной режим',
    6 => 'Действия при ДТП',
    7 => 'Световые и звуковые сигналы',
    8 => 'Пешеходные переходы',
    9 => 'Начало движения и маневрирование',
    10 => 'Расположение ТС на проезжей части',
    11 => 'Общие обязанности водителя'
];

$paymentData = [
    'amount' => [
        'value' => number_format($price, 2, '.', ''),
        'currency' => 'RUB'
    ],
    'capture' => true, // Для цифровых товаров
    'confirmation' => [
        'type' => 'embedded' // Для виджета
    ],
    'description' => 'Шпаргалка ПДД: ' . $productNames[$productId]
];

$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, 'https://api.yookassa.ru/v3/payments');
curl_setopt($ch, CURLOPT_POST, 1);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($paymentData));
curl_setopt($ch, CURLOPT_USERPWD, "$shopId:$secretKey");
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Content-Type: application/json',
    'Idempotence-Key: ' . uniqid()
]);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

$response = curl_exec($ch);
echo $response;
curl_close($ch);
?>
