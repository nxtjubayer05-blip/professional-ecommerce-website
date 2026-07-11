<?php
/* =====================================================
   ORDERS API
   ===================================================== */

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE');

require_once '../config/database.php';

$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
        getOrders();
        break;
    case 'POST':
        createOrder();
        break;
    case 'PUT':
        updateOrder();
        break;
    default:
        http_response_code(405);
        echo json_encode(['error' => 'Method not allowed']);
}

// Get all orders or single order
function getOrders() {
    global $conn;
    
    $id = $_GET['id'] ?? null;
    $status = $_GET['status'] ?? null;
    
    if ($id) {
        $sql = $conn->prepare('SELECT * FROM orders WHERE id = ?');
        $sql->bind_param('i', $id);
        $sql->execute();
        $result = $sql->get_result();
        echo json_encode($result->fetch_assoc());
    } else {
        $sql = 'SELECT * FROM orders';
        
        if ($status) {
            $sql .= $conn->prepare(' WHERE status = ?');
        }
        
        $sql .= ' ORDER BY created_at DESC';
        
        $result = $conn->query($sql);
        $orders = [];
        
        while ($row = $result->fetch_assoc()) {
            $orders[] = $row;
        }
        
        echo json_encode($orders);
    }
}

// Create new order
function createOrder() {
    global $conn;
    
    $data = json_decode(file_get_contents('php://input'), true);
    
    $customer_name = $data['customer_name'] ?? '';
    $customer_email = $data['customer_email'] ?? '';
    $customer_phone = $data['customer_phone'] ?? '';
    $total = $data['total'] ?? 0;
    $status = 'pending';
    
    if (!$customer_name || !$total) {
        http_response_code(400);
        echo json_encode(['error' => 'অর্ডার তথ্য অসম্পূর্ণ']);
        return;
    }
    
    $sql = $conn->prepare(
        'INSERT INTO orders (customer_name, customer_email, customer_phone, total, status, created_at) VALUES (?, ?, ?, ?, ?, NOW())'
    );
    $sql->bind_param('sssds', $customer_name, $customer_email, $customer_phone, $total, $status);
    
    if ($sql->execute()) {
        echo json_encode(['success' => true, 'order_id' => $conn->insert_id]);
    } else {
        http_response_code(500);
        echo json_encode(['error' => 'অর্ডার তৈরি করা যায়নি']);
    }
}

// Update order status
function updateOrder() {
    global $conn;
    
    $data = json_decode(file_get_contents('php://input'), true);
    
    $id = $data['id'] ?? 0;
    $status = $data['status'] ?? '';
    
    if (!$id || !$status) {
        http_response_code(400);
        echo json_encode(['error' => 'অর্ডার ID এবং স্ট্যাটাস প্রয়োজন']);
        return;
    }
    
    $sql = $conn->prepare(
        'UPDATE orders SET status = ?, updated_at = NOW() WHERE id = ?'
    );
    $sql->bind_param('si', $status, $id);
    
    if ($sql->execute()) {
        echo json_encode(['success' => true]);
    } else {
        http_response_code(500);
        echo json_encode(['error' => 'অর্ডার আপডেট করা যায়নি']);
    }
}

?>
