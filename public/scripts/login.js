/**
 * login.js
 * Troca e-mail+senha por um token JWT e guarda a sessão localmente.
 */

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('loginForm').addEventListener('submit', fazerLogin);
});

async function fazerLogin(evento) {
    evento.preventDefault();

    const email = document.getElementById('email').value;
    const senha = document.getElementById('senha').value;

    try {
        const resposta = await window.api.login(email, senha);
        salvarSessao(resposta);
        window.location.href = 'index.html';
    } catch (erro) {
        mostrarAlerta(erro.message, 'danger');
    }
}
