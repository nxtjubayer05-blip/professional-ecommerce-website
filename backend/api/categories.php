<?php
/* =====================================================
   CATEGORIES API
   ===================================================== */

header('Content-Type: application/json; charset=utf-8');

require_once '../config/database.php';

$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
        getCategories();
        break;
    case 'POST':
        createCategory();
        break;
    default:
        http_response_code(405);
        echo json_encode(['error' => 'Method not allowed']);
}

// Get all categories
function getCategories() {
    global $conn;
    
    $sql = 'SELECT * FROM categories WHERE status = "active" ORDER BY name';
    $result = $conn->query($sql);
    
    $categories = [];
    while ($row = $result->fetch_assoc()) {
        $categories[] = $row;
    }
    
    echo json_encode($categories);
}

// Create category
function createCategory() {
    global $conn;
    
    $data = json_decode(file_get_contents('php://input'), true);
    
    $name = $data['name'] ?? '';
    
    if (!$name) {
        http_response_code(400);
        echo json_encode(['error' => 'বিভাগের নাম প্রয়োজন']);
        return;
    }
    
    $sql = $conn->prepare(
        'INSERT INTO categories (name, status, created_at) VALUES (?, "active", NOW())'
    );
    $sql->bind_param('s', $name);
    
    if ($sql->execute()) {
        echo json_encode(['success' => true, 'id' => $conn->insert_id]);
    } else {
        http_response_code(500);
        echo json_encode(['error' => 'বিভাগ তৈরি করা যায়নি']);
    }
}

?>
