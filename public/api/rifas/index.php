<?php
require_once __DIR__ . '/../db.php';
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $q = $_GET['q'] ?? '';
    $page = max(1, (int)($_GET['page'] ?? 1));
    $limit = max(1, min(100, (int)($_GET['limit'] ?? 10)));
    $orderBy = $_GET['orderBy'] ?? 'createdAt';
    $orderDir = strtolower($_GET['orderDir'] ?? 'desc') === 'asc' ? 'asc' : 'desc';
    $offset = ($page - 1) * $limit;

    $where = "WHERE estado = 'ACTIVA'";
    $params = [];
    if ($q !== '') {
        $where .= " AND (nombre LIKE :q OR descripcion LIKE :q)";
        $params[':q'] = '%' . $q . '%';
    }

    $allowedOrder = ['nombre', 'createdAt', 'fechaSorteo'];
    if (!in_array($orderBy, $allowedOrder, true)) {
        $orderBy = 'createdAt';
    }

    $sql = "SELECT id, nombre, descripcion, portadaUrl, fechaSorteo, precioPorBoleto, precioUSD, totalBoletos, limitePorPersona, tiempoReserva, mostrarTopCompradores, createdAt, updatedAt, (SELECT COUNT(*) FROM tickets WHERE tickets.rifaId = rifas.id AND estado = 'PAGADO') AS ticketsPagados FROM rifas $where ORDER BY $orderBy $orderDir LIMIT :limit OFFSET :offset";
    $stmt = $pdo->prepare($sql);
    $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
    $stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
    foreach ($params as $k => $v) {
        $stmt->bindValue($k, $v);
    }
    $stmt->execute();
    $data = $stmt->fetchAll(PDO::FETCH_ASSOC);

    $countStmt = $pdo->prepare("SELECT COUNT(*) FROM rifas $where");
    foreach ($params as $k => $v) {
        $countStmt->bindValue($k, $v);
    }
    $countStmt->execute();
    $total = (int) $countStmt->fetchColumn();

    echo json_encode([
        'success' => true,
        'data' => $data,
        'pagination' => [
            'page' => $page,
            'limit' => $limit,
            'total' => $total,
            'totalPages' => (int) ceil($total / $limit),
        ],
    ]);
    exit;
}

http_response_code(405);
echo json_encode(['success' => false, 'error' => 'Method not allowed']);
