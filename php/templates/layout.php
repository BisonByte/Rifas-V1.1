<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title><?= htmlspecialchars($title ?? 'Rifas') ?></title>
    <link rel="stylesheet" href="/styles.css">
    <script defer src="/app.js"></script>
</head>
<body>
<?= $content ?? '' ?>
</body>
</html>
