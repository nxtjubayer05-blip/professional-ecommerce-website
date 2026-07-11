<?php
/* =====================================================
   DATABASE CONFIGURATION
   ===================================================== */

// Database credentials
define('DB_HOST', 'localhost');
define('DB_USER', 'root');
define('DB_PASS', '');
define('DB_NAME', 'ecommerce_db');

// Create connection
$conn = new mysqli(DB_HOST, DB_USER, DB_PASS, DB_NAME);

// Check connection
if ($conn->connect_error) {
    die(json_encode(['error' => 'সংযোগ ব্যর্থ: ' . $conn->connect_error]));
}

// Set charset
$conn->set_charset('utf8mb4');

// Enable error reporting
ini_set('display_errors', 1);
error_reporting(E_ALL);

?>
