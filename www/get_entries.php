<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
require 'config.php';

try {
    $result = $conn->query("SELECT 
        id,
        DATE_FORMAT(date, '%Y-%m-%d') as date,
        sleep_h,
        sleep_m,
        score,
        comments,
        tags,
        cut_sleep,
        shaking,
        seizure,
        partner,
        pill1,
        pill2,
        pill3
        FROM entries ORDER BY date DESC");
    
    $entries = [];
    while($row = $result->fetch_assoc()) {
        $entries[] = $row;
    }
    
    echo json_encode($entries);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}

$conn->close();
?>