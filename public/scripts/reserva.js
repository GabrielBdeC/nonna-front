/**
 * reserva.js
 * Envia o formulário de reserva de mesa para a API.
 */

document.addEventListener('DOMContentLoaded', () => {
    const hoje = new Date().toISOString().split('T')[0];
    document.getElementById('data').setAttribute('min', hoje);

    document.getElementById('reservaForm').addEventListener('submit', enviarReserva);
});

async function enviarReserva(evento) {
    evento.preventDefault();

    const form = evento.target;
    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }

    const data = document.getElementById('data').value;
    const horario = document.getElementById('horario').value;
    const areaSelecionada = form.querySelector('input[name="area"]:checked');

    const reserva = {
        nome: document.getElementById('nome').value,
        email: document.getElementById('email').value,
        telefone: document.getElementById('telefone').value,
        dataHora: `${data}T${horario}:00`,
        quantidadePessoas: parseInt(document.getElementById('pessoas').value, 10),
        areaPreferida: areaSelecionada.value.toUpperCase(),
        precisaCadeirao: document.getElementById('cadeirao').checked,
        comemoracaoAniversario: document.getElementById('aniversario').checked,
        precisaAcessibilidade: document.getElementById('acessibilidade').checked,
        observacoes: document.getElementById('observacoes').value || null
    };

    const botao = form.querySelector('button[type="submit"]');
    botao.disabled = true;
    try {
        await window.api.criarReserva(reserva);
        mostrarAlerta('Reserva confirmada! Em breve entraremos em contato para confirmar.', 'success');
        form.reset();
    } catch (erro) {
        mostrarAlerta(`Não foi possível confirmar a reserva: ${erro.message}`, 'danger');
    } finally {
        botao.disabled = false;
    }
}
