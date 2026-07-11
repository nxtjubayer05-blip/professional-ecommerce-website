<?php
/* =====================================================
   PRODUCTS API
   ===================================================== */

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE');

require_once '../config/database.php';

$method = $_SERVER['REQUEST_METHOD'];
$request = explode('/', trim($_SERVER['PATH_INFO'] ?? '', '/'));

switch ($method) {
    case 'GET':
        getProducts();
        break;
    case 'POST':
        createProduct();
        break;
    case 'PUT':
        updateProduct();
        break;
    case 'DELETE':
        deleteProduct();
        break;
    default:
        http_response_code(405);
        echo json_encode(['error' => 'Method not allowed']);
}

// Get all products or single product
function getProducts() {
    global $conn;
    
    $id = $_GET['id'] ?? null;
    $category = $_GET['category'] ?? null;
    
    if ($id) {
        $sql = $conn->prepare('SELECT * FROM products WHERE id = ?');
        $sql->bind_param('i', $id);
        $sql->execute();
        $result = $sql->get_result();
        echo json_encode($result->fetch_assoc());
    } else {
        $sql = 'SELECT * FROM products WHERE status = "active"';
        
        if ($category && $category !== 'all') {
            $sql .= $conn->prepare(' AND category = ?');
        }
        
        $sql .= ' ORDER BY id DESC';
        
        $result = $conn->query($sql);
        $products = [];
        
        while ($row = $result->fetch_assoc()) {
            $products[] = $row;
        }
        
        echo json_encode($products);
    }
}

// Create new product
function createProduct() {
    global $conn;
    
    $data = json_decode(file_get_contents('php://input'), true);
    
    $name = $data['name'] ?? '';
    $category = $data['category'] ?? '';
    $price = $data['price'] ?? 0;
    $description = $data['description'] ?? '';
    
    if (!$name || !$price) {
        http_response_code(400);
        echo json_encode(['error' => 'নাম এবং মূল্য প্রয়োজন']);
        return;
    }
    
    $sql = $conn->prepare(
        'INSERT INTO products (name, category, price, description, status, created_at) VALUES (?, ?, ?, ?, "active", NOW())'
    );
    $sql->bind_param('ssds', $name, $category, $price, $description);
    
    if ($sql->execute()) {
        echo json_encode(['success' => true, 'id' => $conn->insert_id]);
    } else {
        http_response_code(500);
        echo json_encode(['error' => 'পণ্য তৈরি করা যায়নি']);
    }
}

// Update product
function updateProduct() {
    global $conn;
    
    $data = json_decode(file_get_contents('php://input'), true);
    
    $id = $data['id'] ?? 0;
    $name = $data['name'] ?? '';
    $price = $data['price'] ?? 0;
    
    if (!$id) {
        http_response_code(400);
        echo json_encode(['error' => 'পণ্য ID প্রয়োজন']);
        return;
    }
    
    $sql = $conn->prepare(
        'UPDATE products SET name = ?, price = ?, updated_at = NOW() WHERE id = ?'
    );
    $sql->bind_param('sdi', $name, $price, $id);
    
    if ($sql->execute()) {
        echo json_encode(['success' => true]);
    } else {
        http_response_code(500);
        echo json_encode(['error' => 'পণ্য আপডেট করা যায়নি']);
    }
}

// Delete product
function deleteProduct() {
    global $conn;
    
    $data = json_decode(file_get_contents('php://input'), true);
    $id = $data['id'] ?? 0;
    
    if (!$id) {
        http_response_code(400);
        echo json_encode(['error' => 'পণ্য ID প্রয়োজন']);
        return;
    }
    
    $sql = $conn->prepare('DELETE FROM products WHERE id = ?');
    $sql->bind_param('i', $id);
    
    if ($sql->execute()) {
        echo json_encode(['success' => true]);
    } else {
        http_response_code(500);
        echo json_encode(['error' => 'পণ্য মুছে ফেলা যায়নি']);
    }
}

?>
