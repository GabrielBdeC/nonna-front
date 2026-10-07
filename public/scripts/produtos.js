/**
 * produtos.js
 * Administração de categorias e produtos (sem autenticação por enquanto).
 */

let categoriasCache = [];

document.addEventListener('DOMContentLoaded', async () => {
    // Espera as categorias chegarem antes de carregar os produtos: o card
    // de produto mostra o nome da categoria, e precisa do cache pronto.
    await carregarCategorias();
    carregarProdutos();

    document.getElementById('categoriaForm').addEventListener('submit', criarCategoria);
    document.getElementById('btnNovoProduto').addEventListener('click', abrirModalNovoProduto);
    document.getElementById('btnSalvarProduto').addEventListener('click', salvarProduto);
});

async function carregarCategorias() {
    try {
        const pagina = await window.api.getCategorias();
        categoriasCache = pagina.content;
        renderizarCategorias();
        preencherSelectCategorias();
    } catch (erro) {
        mostrarAlerta('Não foi possível carregar as categorias.', 'danger');
    }
}

function renderizarCategorias() {
    const container = document.getElementById('categorias-list');
    container.innerHTML = '';

    if (categoriasCache.length === 0) {
        container.innerHTML = '<p class="text-muted">Nenhuma categoria cadastrada ainda.</p>';
        return;
    }

    categoriasCache.forEach((categoria) => {
        const pill = document.createElement('span');
        pill.className = 'badge-tipo rounded-pill px-3 py-2 d-inline-flex align-items-center gap-2';
        pill.innerHTML = `${categoria.nome} <button type="button" class="btn-close btn-close-white" style="font-size: 0.6rem" aria-label="Remover"></button>`;
        pill.querySelector('button').onclick = () => removerCategoria(categoria.id);
        container.appendChild(pill);
    });
}

function preencherSelectCategorias() {
    const select = document.getElementById('produto-categoria');
    select.innerHTML = '<option value="">Selecione</option>';
    categoriasCache.forEach((categoria) => {
        const option = document.createElement('option');
        option.value = categoria.id;
        option.textContent = categoria.nome;
        select.appendChild(option);
    });
}

async function criarCategoria(evento) {
    evento.preventDefault();
    const input = document.getElementById('categoria-nome');
    try {
        await window.api.criarCategoria({ nome: input.value });
        input.value = '';
        mostrarAlerta('Categoria criada.', 'success');
        await carregarCategorias();
    } catch (erro) {
        mostrarAlerta(`Erro ao criar categoria: ${erro.message}`, 'danger');
    }
}

async function removerCategoria(id) {
    if (!confirm('Remover esta categoria? Os produtos dela também serão removidos.')) return;
    try {
        await window.api.removerCategoria(id);
        mostrarAlerta('Categoria removida.', 'success');
        await carregarCategorias();
        await carregarProdutos();
    } catch (erro) {
        mostrarAlerta(`Erro ao remover categoria: ${erro.message}`, 'danger');
    }
}

async function carregarProdutos() {
    const container = document.getElementById('produtos-grid');
    try {
        const pagina = await window.api.getProdutos();
        renderizarProdutos(pagina.content);
    } catch (erro) {
        container.innerHTML = '<div class="col-12"><p class="text-center">Não foi possível carregar os produtos.</p></div>';
    }
}

function renderizarProdutos(produtos) {
    const container = document.getElementById('produtos-grid');
    container.innerHTML = '';

    if (produtos.length === 0) {
        container.innerHTML = '<div class="col-12"><p class="text-muted">Nenhum produto cadastrado.</p></div>';
        return;
    }

    produtos.forEach((produto) => {
        const categoria = categoriasCache.find((c) => c.id === produto.idCategoria);
        const coluna = document.createElement('div');
        coluna.className = 'col-md-4 col-sm-12 mb-4';
        coluna.innerHTML = `
            <div class="border rounded p-3 h-100 d-flex flex-column">
                <div class="d-flex justify-content-between align-items-start">
                    <h5>${produto.nome}</h5>
                    <span class="badge-tipo rounded-pill px-2 py-1 small">${categoria ? categoria.nome : '—'}</span>
                </div>
                <p class="text-muted small">${produto.descricao || ''}</p>
                <p class="mb-2">R$ ${formatarPreco(produto.preco)}</p>
                <div class="mt-auto d-flex gap-2">
                    <button type="button" class="btn btn-sm btn-outline-secondary">Editar</button>
                    <button type="button" class="btn btn-sm btn-outline-danger">Excluir</button>
                </div>
            </div>
        `;
        coluna.querySelector('.btn-outline-secondary').onclick = () => abrirModalEditarProduto(produto);
        coluna.querySelector('.btn-outline-danger').onclick = () => excluirProduto(produto.id);
        container.appendChild(coluna);
    });
}

function abrirModalNovoProduto() {
    document.getElementById('produtoForm').reset();
    document.getElementById('produto-id').value = '';
    document.getElementById('produtoModalTitulo').textContent = 'Novo produto';
    new bootstrap.Modal(document.getElementById('produtoModal')).show();
}

function abrirModalEditarProduto(produto) {
    document.getElementById('produto-id').value = produto.id;
    document.getElementById('produto-nome').value = produto.nome;
    document.getElementById('produto-descricao').value = produto.descricao || '';
    document.getElementById('produto-preco').value = produto.preco;
    document.getElementById('produto-categoria').value = produto.idCategoria;
    document.getElementById('produto-imagem').value = produto.imagem || '';
    document.getElementById('produtoModalTitulo').textContent = 'Editar produto';
    new bootstrap.Modal(document.getElementById('produtoModal')).show();
}

async function salvarProduto() {
    const form = document.getElementById('produtoForm');
    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }

    const id = document.getElementById('produto-id').value;
    const produto = {
        nome: document.getElementById('produto-nome').value,
        descricao: document.getElementById('produto-descricao').value || null,
        preco: parseFloat(document.getElementById('produto-preco').value),
        idCategoria: document.getElementById('produto-categoria').value,
        imagem: document.getElementById('produto-imagem').value || null
    };

    try {
        if (id) {
            await window.api.atualizarProduto(id, produto);
            mostrarAlerta('Produto atualizado.', 'success');
        } else {
            await window.api.criarProduto(produto);
            mostrarAlerta('Produto criado.', 'success');
        }
        bootstrap.Modal.getInstance(document.getElementById('produtoModal')).hide();
        await carregarProdutos();
    } catch (erro) {
        mostrarAlerta(`Erro ao salvar produto: ${erro.message}`, 'danger');
    }
}

async function excluirProduto(id) {
    if (!confirm('Excluir este produto?')) return;
    try {
        await window.api.removerProduto(id);
        mostrarAlerta('Produto removido.', 'success');
        await carregarProdutos();
    } catch (erro) {
        mostrarAlerta(`Erro ao remover produto: ${erro.message}`, 'danger');
    }
}
