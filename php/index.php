<?php
$title = 'Rifas - Inicio';
ob_start();
?>
<h1>Bienvenido a Rifas</h1>
<form id="ticket-form">
    <label for="ticket">Número de ticket</label>
    <input type="number" id="ticket" name="ticket" required min="1">
    <button type="submit">Comprar</button>
</form>
<div id="message"></div>
<?php
$content = ob_get_clean();
include __DIR__ . '/templates/layout.php';
