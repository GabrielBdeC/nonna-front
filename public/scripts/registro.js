/**
 * registro.js
 * Cadastro público de cliente. O "tipo" nem é enviado -- o back ignora
 * qualquer tipo mandado por quem não está logado como administrador e
 * força CLIENTE, então nem vale a pena oferecer essa escolha aqui.
 */

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('registroForm').addEventListener('submit', criarConta);
});

async function criarConta(evento) {
    evento.preventDefault();

    const nome = document.getElementById('nome').value;
    const email = document.getElementById('email').value;
    const senha = document.getElementById('senha').value;
    const telefone = document.getElementById('telefone').value || null;

    try {
        await window.api.criarUsuario({ nome, email, senha, telefone, tipo: 'CLIENTE' });
        // Conta criada: já aproveita e loga, para não pedir os dados de novo.
        const sessao = await window.api.login(email, senha);
        salvarSessao(sessao);
        window.location.href = 'index.html';
    } catch (erro) {
        mostrarAlerta(erro.message, 'danger');
    }
}
