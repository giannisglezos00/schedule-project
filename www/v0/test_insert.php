<?php
require 'config.php';

$sql = "INSERT INTO entries (date, sleep_h, sleep_m) 
        VALUES (CURDATE(), 7, 30)";

if ($conn->query($sql) === TRUE) {
    echo "✅ Test entry created! ID: " . $conn->insert_id;
} else {
    echo "❌ Insert failed: " . $conn->error;
}
?>