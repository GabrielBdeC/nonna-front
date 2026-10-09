/**
 * sessao.js
 * Guarda o token JWT e os dados do usuário logado no localStorage do
 * navegador (sobrevive a reloads, mas é só desse navegador). Carregar
 * este script ANTES de api.js: ele é quem decide se uma requisição sai
 * com "Authorization: Bearer ...".
 */

const CHAVE_SESSAO = 'nonna_sessao';

function salvarSessao(sessao) {
    localStorage.setItem(CHAVE_SESSAO, JSON.stringify(sessao));
}

function obterSessao() {
    try {
        return JSON.parse(localStorage.getItem(CHAVE_SESSAO));
    } catch {
        return null;
    }
}

function limparSessao() {
    localStorage.removeItem(CHAVE_SESSAO);
}

function estaLogado() {
    return !!obterSessao()?.token;
}

function obterUsuarioLogado() {
    return obterSessao()?.usuario ?? null;
}

function ehAdministrador() {
    return obterUsuarioLogado()?.tipo === 'ADMINISTRADOR';
}

/** Chame no topo de uma página que só pode ser vista por quem está logado. */
function exigirLogin() {
    if (!estaLogado()) {
        window.location.href = 'login.html';
    }
}

/** Chame no topo de uma página administrativa. */
function exigirAdministrador() {
    if (!estaLogado()) {
        window.location.href = 'login.html';
        return;
    }
    if (!ehAdministrador()) {
        alert('Essa área é restrita a administradores.');
        window.location.href = 'index.html';
    }
}

/**
 * Ajusta a nav de cada página: esconde os links de administração de quem
 * não é admin, e troca "Entrar" por "Sair (nome)" quando há sessão.
 * O back-end já recusa essas rotas para quem não tem permissão -- isso
 * aqui é só para não oferecer na tela um link que vai dar 403.
 */
function montarNavAuth() {
    const linksNav = document.querySelector('.links-nav');
    if (!linksNav) return;

    const linksAdmin = ['produtos.html', 'pedidos.html', 'usuarios.html'];
    linksNav.querySelectorAll('a').forEach((link) => {
        if (linksAdmin.includes(link.getAttribute('href')) && !ehAdministrador()) {
            link.remove();
        }
    });

    const sessao = obterSessao();

    if (sessao) {
        const linkPerfil = document.createElement('a');
        linkPerfil.href = 'perfil.html';
        linkPerfil.textContent = 'Minha conta';
        linksNav.appendChild(linkPerfil);
    }

    const linkConta = document.createElement('a');
    linkConta.href = '#';

    if (sessao) {
        linkConta.textContent = `Sair (${sessao.usuario.nome})`;
        linkConta.onclick = (evento) => {
            evento.preventDefault();
            limparSessao();
            window.location.href = 'index.html';
        };
    } else {
        linkConta.textContent = 'Entrar';
        linkConta.href = 'login.html';
    }
    linksNav.appendChild(linkConta);
}

document.addEventListener('DOMContentLoaded', montarNavAuth);
