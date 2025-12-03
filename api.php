<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, GET, DELETE');
header('Access-Control-Allow-Headers: Content-Type');

$dataFile = 'data_siswa.json';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Simpan data
    $input = json_decode(file_get_contents('php://input'), true);
    $data = [];
    
    if (file_exists($dataFile)) {
        $data = json_decode(file_get_contents($dataFile), true);
    }
    
    $input['id'] = uniqid();
    $input['waktu'] = date('Y-m-d H:i:s');
    $data[] = $input;
    
    file_put_contents($dataFile, json_encode($data));
    echo json_encode(['success' => true, 'message' => 'Data berhasil disimpan']);
    
} elseif ($_SERVER['REQUEST_METHOD'] === 'GET') {
    // Ambil data
    if (file_exists($dataFile)) {
        echo file_get_contents($dataFile);
    } else {
        echo json_encode([]);
    }
    
} elseif ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
    // Hapus semua data
    if (file_exists($dataFile)) {
        unlink($dataFile);
    }
    echo json_encode(['success' => true, 'message' => 'Semua data dihapus']);
}
?>
