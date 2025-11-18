<?php
// 1. Настройка и подключение к базе данных
// !!! Замените эти значения на свои !!!
$servername = "localhost"; // Обычно 'localhost' для локальной разработки
$username = "root";        // Ваше имя пользователя MySQL
$password = "0894974649Han"; // Ваш пароль MySQL
$dbname = "";    // Имя вашей базы данных

// Создаем новое соединение с MySQL
$conn = new mysqli($servername, $username, $password, $dbname);

// Проверяем соединение
if ($conn->connect_error) {
    // В случае ошибки соединения, отправляем клиенту HTTP-код ошибки 500
    http_response_code(500);
    die("Connection failed: " . $conn->connect_error);
}

// 2. Выполнение SQL-запроса
// Выберите нужную вам таблицу и поля
$sql = "SELECT id, name, price FROM products";
$result = $conn->query($sql);

$data = []; // Массив для хранения данных
if ($result->num_rows > 0) {
    // 3. Сбор данных из результата
    while($row = $result->fetch_assoc()) {
        $data[] = $row; // Добавляем каждую строку в массив
    }
}
// else {
//   // Если нет данных, массив $data останется пустым ([]), что нормально
// }

// Закрываем соединение с базой данных
$conn->close();

// 4. Отправка ответа клиенту
// Обязательно устанавливаем заголовок Content-Type: application/json
header('Content-Type: application/json');

// Преобразуем PHP-массив $data в строку JSON и выводим её
echo json_encode($data);

// Важно: PHP-скрипт не должен содержать ничего после echo json_encode(),
// кроме закрывающего тега (если он используется) или его отсутствия.
?>