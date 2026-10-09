/**
 * usuarios.js
 * Cadastro e edição de usuários (clientes e administradores).
 */

document.addEventListener('DOMContentLoaded', () => {
    exigirAdministrador();

    carregarUsuarios();
    document.getElementById('btnNovoUsuario').addEventListener('click', abrirModalNovoUsuario);
    document.getElementById('btnSalvarUsuario').addEventListener('click', salvarUsuario);
});

async function carregarUsuarios() {
    const corpo = document.getElementById('usuarios-tbody');
    try {
        const pagina = await window.api.getUsuarios();
        renderizarUsuarios(pagina.content);
    } catch (erro) {
        corpo.innerHTML = '<tr><td colspan="5" class="text-center">Não foi possível carregar os usuários.</td></tr>';
    }
}

function renderizarUsuarios(usuarios) {
    const corpo = document.getElementById('usuarios-tbody');
    corpo.innerHTML = '';

    if (usuarios.length === 0) {
        corpo.innerHTML = '<tr><td colspan="5" class="text-center">Nenhum usuário cadastrado.</td></tr>';
        return;
    }

    usuarios.forEach((usuario) => {
        const linha = document.createElement('tr');
        linha.innerHTML = `
            <td>${usuario.nome}</td>
            <td>${usuario.email}</td>
            <td>${usuario.telefone || '—'}</td>
            <td><span class="badge-tipo rounded-pill px-2 py-1">${usuario.tipo}</span></td>
            <td><button type="button" class="btn btn-sm btn-outline-secondary">Editar</button></td>
        `;
        linha.querySelector('button').onclick = () => abrirModalEditarUsuario(usuario);
        corpo.appendChild(linha);
    });
}

function abrirModalNovoUsuario() {
    document.getElementById('usuarioForm').reset();
    document.getElementById('usuario-id').value = '';
    document.getElementById('usuario-senha-container').hidden = false;
    document.getElementById('usuario-senha-aviso').hidden = true;
    document.getElementById('usuarioModalTitulo').textContent = 'Novo usuário';
    new bootstrap.Modal(document.getElementById('usuarioModal')).show();
}

function abrirModalEditarUsuario(usuario) {
    document.getElementById('usuario-id').value = usuario.id;
    document.getElementById('usuario-nome').value = usuario.nome;
    document.getElementById('usuario-email').value = usuario.email;
    document.getElementById('usuario-senha').value = '';
    document.getElementById('usuario-telefone').value = usuario.telefone || '';
    document.getElementById('usuario-tipo').value = usuario.tipo;

    // Admin editando outro usuario nunca troca a senha dele -- o back
    // ignora esse campo de qualquer jeito, entao nem mostra o input.
    const ehProprioUsuario = obterUsuarioLogado()?.id === usuario.id;
    document.getElementById('usuario-senha-container').hidden = !ehProprioUsuario;
    document.getElementById('usuario-senha-aviso').hidden = ehProprioUsuario;

    document.getElementById('usuarioModalTitulo').textContent = 'Editar usuário';
    new bootstrap.Modal(document.getElementById('usuarioModal')).show();
}

async function salvarUsuario() {
    const form = document.getElementById('usuarioForm');
    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }

    const id = document.getElementById('usuario-id').value;
    const senha = document.getElementById('usuario-senha').value;

    if (!id && !senha) {
        mostrarAlerta('Defina uma senha para o novo usuário.', 'danger');
        return;
    }

    const usuario = {
        nome: document.getElementById('usuario-nome').value,
        email: document.getElementById('usuario-email').value,
        senha: senha || null,
        telefone: document.getElementById('usuario-telefone').value || null,
        tipo: document.getElementById('usuario-tipo').value
    };

    try {
        if (id) {
            await window.api.atualizarUsuario(id, usuario);
            mostrarAlerta('Usuário atualizado.', 'success');
        } else {
            await window.api.criarUsuario(usuario);
            mostrarAlerta('Usuário criado.', 'success');
        }
        bootstrap.Modal.getInstance(document.getElementById('usuarioModal')).hide();
        await carregarUsuarios();
    } catch (erro) {
        mostrarAlerta(`Erro ao salvar usuário: ${erro.message}`, 'danger');
    }
}
