<?php
/* =====================================================
   SETTINGS API
   ===================================================== */

header('Content-Type: application/json; charset=utf-8');

require_once '../config/database.php';

$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
        getSettings();
        break;
    case 'POST':
        updateSettings();
        break;
    default:
        http_response_code(405);
        echo json_encode(['error' => 'Method not allowed']);
}

// Get all settings
function getSettings() {
    global $conn;
    
    $sql = 'SELECT * FROM settings';
    $result = $conn->query($sql);
    
    $settings = [];
    while ($row = $result->fetch_assoc()) {
        $settings[$row['key']] = $row['value'];
    }
    
    // Format social links
    if (isset($settings['social_links'])) {
        $settings['social_links'] = json_decode($settings['social_links'], true);
    }
    
    echo json_encode($settings);
}

// Update settings
function updateSettings() {
    global $conn;
    
    $data = json_decode(file_get_contents('php://input'), true);
    
    foreach ($data as $key => $value) {
        if (is_array($value)) {
            $value = json_encode($value);
        }
        
        // Check if setting exists
        $check = $conn->query('SELECT id FROM settings WHERE `key` = "' . $conn->real_escape_string($key) . '"');
        
        if ($check->num_rows > 0) {
            $sql = $conn->prepare('UPDATE settings SET value = ? WHERE `key` = ?');
            $sql->bind_param('ss', $value, $key);
        } else {
            $sql = $conn->prepare('INSERT INTO settings (`key`, value) VALUES (?, ?)');
            $sql->bind_param('ss', $key, $value);
        }
        
        $sql->execute();
    }
    
    echo json_encode(['success' => true]);
}

?>
