document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('ticket-form');
    const message = document.getElementById('message');
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const ticket = document.getElementById('ticket');
        const value = parseInt(ticket.value, 10);
        if (isNaN(value) || value <= 0) {
            alert('Ingrese un número de ticket válido');
            return;
        }
        message.textContent = `Formulario enviado con ticket ${value}`;
        form.reset();
    });
});
