<?php

$host = 'localhost';
$username = 'root'; // Change if needed
$password = ''; // Change if needed
$database = 'sleep_tracker';

$conn = new mysqli($host, $username, $password, $database);

if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

header('Content-Type: application/json');

$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
        $sql = "SELECT * FROM sleep_data ORDER BY date DESC";
        $result = $conn->query($sql);
        $data = [];
        while ($row = $result->fetch_assoc()) {
            $data[] = $row;
        }
        echo json_encode($data);
        break;
    
    case 'POST':
        $input = json_decode(file_get_contents('php://input'), true);
        $stmt = $conn->prepare("INSERT INTO sleep_data (date, days_passed, sleep_score, night_sleep_time, day_nap, deep_sleep, light_sleep, rem_sleep, cut_sleep, shaking, seizure, slept_with_partner, comments, tags, calories_burned, steps_taken, weight, hours_stood, pill1, pill2, pill3) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
        $stmt->bind_param("siiissssiiisssiiidiii",
            $input['date'], $input['days_passed'], $input['sleep_score'], $input['night_sleep_time'],
            $input['day_nap'], $input['deep_sleep'], $input['light_sleep'], $input['rem_sleep'],
            $input['cut_sleep'], $input['shaking'], $input['seizure'], $input['slept_with_partner'],
            $input['comments'], $input['tags'], $input['calories_burned'], $input['steps_taken'],
            $input['weight'], $input['hours_stood'], $input['pill1'], $input['pill2'], $input['pill3']
        );
        echo json_encode(["success" => $stmt->execute()]);
        break;
    
    case 'PUT':
        $input = json_decode(file_get_contents('php://input'), true);
        $stmt = $conn->prepare("UPDATE sleep_data SET sleep_score=?, night_sleep_time=?, day_nap=?, deep_sleep=?, light_sleep=?, rem_sleep=?, cut_sleep=?, shaking=?, seizure=?, slept_with_partner=?, comments=?, tags=?, calories_burned=?, steps_taken=?, weight=?, hours_stood=?, pill1=?, pill2=?, pill3=? WHERE id=?");
        $stmt->bind_param("issssiiisssiiidiiii",
            $input['sleep_score'], $input['night_sleep_time'], $input['day_nap'], $input['deep_sleep'],
            $input['light_sleep'], $input['rem_sleep'], $input['cut_sleep'], $input['shaking'],
            $input['seizure'], $input['slept_with_partner'], $input['comments'], $input['tags'],
            $input['calories_burned'], $input['steps_taken'], $input['weight'], $input['hours_stood'],
            $input['pill1'], $input['pill2'], $input['pill3'], $input['id']
        );
        echo json_encode(["success" => $stmt->execute()]);
        break;
    
    case 'DELETE':
        $id = $_GET['id'];
        $stmt = $conn->prepare("DELETE FROM sleep_data WHERE id=?");
        $stmt->bind_param("i", $id);
        echo json_encode(["success" => $stmt->execute()]);
        break;
}

$conn->close();
