<?php
$databaseUrl = getenv('DATABASE_URL');
if (!$databaseUrl) {
    $databaseUrl = 'sqlite:' . __DIR__ . '/../../prisma/dev.db';
} else {
    if (strpos($databaseUrl, 'file:') === 0) {
        $path = substr($databaseUrl, 5);
        if ($path && $path[0] !== '/') {
            $databaseUrl = 'sqlite:' . __DIR__ . '/../../prisma/' . $path;
        } else {
            $databaseUrl = 'sqlite:' . $path;
        }
    }
}
try {
    $pdo = new PDO($databaseUrl);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (Exception $e) {
    http_response_code(500);
    header('Content-Type: application/json');
    echo json_encode(['success' => false, 'error' => 'Database connection failed']);
    exit;
}
