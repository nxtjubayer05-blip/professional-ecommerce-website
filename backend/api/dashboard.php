<?php
/* =====================================================
   DASHBOARD API
   ===================================================== */

header('Content-Type: application/json; charset=utf-8');

require_once '../config/database.php';

// Get dashboard statistics
$stats = [];

// Total users
$result = $conn->query('SELECT COUNT(*) as count FROM users');
$stats['total_users'] = $result->fetch_assoc()['count'];

// Total products
$result = $conn->query('SELECT COUNT(*) as count FROM products WHERE status = "active"');
$stats['total_products'] = $result->fetch_assoc()['count'];

// Total orders
$result = $conn->query('SELECT COUNT(*) as count FROM orders');
$stats['total_orders'] = $result->fetch_assoc()['count'];

// Total revenue
$result = $conn->query('SELECT SUM(total) as total FROM orders WHERE status = "completed"');
$stats['total_revenue'] = $result->fetch_assoc()['total'] ?? 0;

// Today's sales
$result = $conn->query('SELECT SUM(total) as total FROM orders WHERE DATE(created_at) = CURDATE() AND status = "completed"');
$stats['today_sales'] = $result->fetch_assoc()['total'] ?? 0;

// Monthly sales
$result = $conn->query('SELECT SUM(total) as total FROM orders WHERE YEAR(created_at) = YEAR(NOW()) AND MONTH(created_at) = MONTH(NOW()) AND status = "completed"');
$stats['monthly_sales'] = $result->fetch_assoc()['total'] ?? 0;

// Pending orders
$result = $conn->query('SELECT id, customer_name, total FROM orders WHERE status = "pending" LIMIT 5');
$stats['pending_orders'] = [];
while ($row = $result->fetch_assoc()) {
    $stats['pending_orders'][] = $row;
}

// Recent orders
$result = $conn->query('SELECT id, customer_name, total, status FROM orders ORDER BY created_at DESC LIMIT 10');
$stats['recent_orders'] = [];
while ($row = $result->fetch_assoc()) {
    $stats['recent_orders'][] = $row;
}

echo json_encode($stats);

?>
