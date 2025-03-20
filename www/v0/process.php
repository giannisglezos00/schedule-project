<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
require 'config.php';

$data = json_decode(file_get_contents('php://input'), true);

try {
    $stmt = $conn->prepare("INSERT INTO entries (
        date, sleep_h, sleep_m, score, comments, tags,
        cut_sleep, shaking, seizure, partner, pill1, pill2, pill3
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
    
    $stmt->bind_param("siiisssssssss",
        $data['date'],
        $data['sleep_h'],
        $data['sleep_m'],
        $data['score'],
        $data['comments'],
        $data['tags'],
        $data['cut_sleep'],
        $data['shaking'],
        $data['seizure'],
        $data['partner'],
        $data['pills'][0],
        $data['pills'][1],
        $data['pills'][2]
    );

    if ($stmt->execute()) {
        echo json_encode(['success' => true, 'id' => $stmt->insert_id]);
    } else {
        throw new Exception("Execute failed: " . $stmt->error);
    }
    
    $stmt->close();
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}

$conn->close();
?>