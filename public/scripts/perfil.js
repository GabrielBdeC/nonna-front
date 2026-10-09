/**
 * perfil.js
 * Tela "Minha conta": o próprio usuário edita seus dados e, se quiser,
 * troca a senha (pedindo a senha atual -- o back também exige isso).
 */

let usuarioAtual = null;

document.addEventListener('DOMContentLoaded', async () => {
    exigirLogin();

    try {
        usuarioAtual = await window.api.me();
        document.getElementById('perfil-nome').value = usuarioAtual.nome;
        document.getElementById('perfil-email').value = usuarioAtual.email;
        document.getElementById('perfil-telefone').value = usuarioAtual.telefone || '';
        document.getElementById('perfil-tipo').value = usuarioAtual.tipo === 'ADMINISTRADOR' ? 'Administrador' : 'Cliente';
    } catch (erro) {
        mostrarAlerta('Não foi possível carregar seus dados.', 'danger');
    }

    document.getElementById('perfilForm').addEventListener('submit', salvarPerfil);
});

async function salvarPerfil(evento) {
    evento.preventDefault();

    const senhaNova = document.getElementById('perfil-senha-nova').value;
    const senhaAtual = document.getElementById('perfil-senha-atual').value;

    if (senhaNova && !senhaAtual) {
        mostrarAlerta('Informe a senha atual para trocar a senha.', 'danger');
        return;
    }

    const dados = {
        nome: document.getElementById('perfil-nome').value,
        email: document.getElementById('perfil-email').value,
        telefone: document.getElementById('perfil-telefone').value || null,
        tipo: usuarioAtual.tipo, // somente leitura aqui -- quem muda tipo é administrador
        senha: senhaNova || null,
        senhaAtual: senhaAtual || null
    };

    try {
        usuarioAtual = await window.api.atualizarUsuario(usuarioAtual.id, dados);

        // Mantem a sessao local (nome/e-mail exibidos na nav) em dia.
        const sessao = obterSessao();
        sessao.usuario = usuarioAtual;
        salvarSessao(sessao);

        document.getElementById('perfil-senha-atual').value = '';
        document.getElementById('perfil-senha-nova').value = '';
        mostrarAlerta('Dados atualizados com sucesso.', 'success');
    } catch (erro) {
        mostrarAlerta(erro.message, 'danger');
    }
}
