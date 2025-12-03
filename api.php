<?php
// api.php - Simpan di folder yang sama dengan file HTML
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, GET, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

$dataFile = 'data_siswa.json';

// Handle preflight request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Create file if not exists
if (!file_exists($dataFile)) {
    file_put_contents($dataFile, json_encode([]));
}

// GET: Read all data
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $data = json_decode(file_get_contents($dataFile), true);
    echo json_encode($data);
    exit();
}

// POST: Add new data
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);
    
    // Validation
    if (empty($input['nama']) || empty($input['mapel'])) {
        echo json_encode(['success' => false, 'message' => 'Data tidak lengkap']);
        exit();
    }
    
    // Read existing data
    $currentData = json_decode(file_get_contents($dataFile), true);
    
    // Add new data
    $newData = [
        'id' => uniqid(),
        'nama' => $input['nama'],
        'kelas' => $input['kelas'] ?? 'XI TSM B',
        'mapel' => $input['mapel'],
        'waktu' => date('Y-m-d H:i:s')
    ];
    
    $currentData[] = $newData;
    
    // Save to file
    file_put_contents($dataFile, json_encode($currentData, JSON_PRETTY_PRINT));
    
    echo json_encode(['success' => true, 'message' => 'Data berhasil disimpan']);
    exit();
}

// DELETE: Clear all data
if ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
    file_put_contents($dataFile, json_encode([]));
    echo json_encode(['success' => true, 'message' => 'Semua data dihapus']);
    exit();
}

// Default response
echo json_encode(['success' => false, 'message' => 'Method tidak didukung']);
?>
