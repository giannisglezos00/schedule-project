<?php
require __DIR__ . '/config.php';

if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

$sql = "SELECT 1";
if ($conn->query($sql) === TRUE) {
    echo "Database connection successful!";
} else {
    echo "Error: " . $conn->error;
}

$conn->close();
?>