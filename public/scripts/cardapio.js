/**
 * cardapio.js
 * Carrega categorias e produtos da API e monta o pedido pelo modal.
 */

let produtosCarregados = [];

document.addEventListener('DOMContentLoaded', () => {
    carregarCategorias();
    carregarProdutos();

    document.getElementById('pedido-tipo-entrega').addEventListener('change', (evento) => {
        const enderecoContainer = document.getElementById('pedido-endereco-container');
        const enderecoInput = document.getElementById('pedido-endereco');
        const precisaEndereco = evento.target.value === 'DELIVERY';
        enderecoContainer.hidden = !precisaEndereco;
        enderecoInput.required = precisaEndereco;
    });

    document.getElementById('btnConfirmarPedido').addEventListener('click', confirmarPedido);
});

async function carregarCategorias() {
    const container = document.getElementById('categorias-filtro');
    try {
        const pagina = await window.api.getCategorias();
        const categorias = pagina.content;

        container.innerHTML = '';

        const btnTodas = document.createElement('button');
        btnTodas.type = 'button';
        btnTodas.className = 'btn btn-outline-secondary categoria-filtro active';
        btnTodas.textContent = 'Todas';
        btnTodas.onclick = () => filtrarPorCategoria(null, btnTodas);
        container.appendChild(btnTodas);

        categorias.forEach((categoria) => {
            const botao = document.createElement('button');
            botao.type = 'button';
            botao.className = 'btn btn-outline-secondary categoria-filtro';
            botao.textContent = categoria.nome;
            botao.onclick = () => filtrarPorCategoria(categoria.id, botao);
            container.appendChild(botao);
        });
    } catch (erro) {
        mostrarAlerta('Não foi possível carregar as categorias.', 'danger');
    }
}

async function carregarProdutos() {
    const container = document.getElementById('produtos-list');
    try {
        const pagina = await window.api.getProdutos();
        produtosCarregados = pagina.content;
        renderizarProdutos(produtosCarregados);
    } catch (erro) {
        container.innerHTML = '<div class="col-12"><p class="text-center">Não foi possível carregar o cardápio. O back-end está rodando?</p></div>';
    }
}

function renderizarProdutos(produtos) {
    const container = document.getElementById('produtos-list');
    container.innerHTML = '';

    if (produtos.length === 0) {
        container.innerHTML = '<div class="col-12"><p class="text-center text-muted">Nenhum produto nessa categoria.</p></div>';
        return;
    }

    produtos.forEach((produto) => {
        const coluna = document.createElement('div');
        coluna.className = 'col-md-4 col-sm-12 mb-4';
        coluna.innerHTML = `
            <div class="border rounded p-3 h-100 d-flex flex-column">
                <div class="d-flex justify-content-between align-items-start gap-3">
                    <div>
                        <h5>${produto.nome}</h5>
                        <p class="text-muted small">${produto.descricao || ''}</p>
                    </div>
                    ${produto.imagem ? `<img src="${produto.imagem}" alt="${produto.nome}" class="cardapio-img rounded">` : ''}
                </div>
                <div class="d-flex justify-content-between align-items-center mt-auto pt-3">
                    <p class="mb-0">R$ ${formatarPreco(produto.preco)}</p>
                    <button type="button" class="btn btn-sm btn-nonna" onclick="abrirModalPedido('${produto.id}')">Pedir</button>
                </div>
            </div>
        `;
        container.appendChild(coluna);
    });
}

function filtrarPorCategoria(idCategoria, botaoClicado) {
    document.querySelectorAll('.categoria-filtro').forEach((botao) => botao.classList.remove('active'));
    botaoClicado.classList.add('active');

    if (!idCategoria) {
        renderizarProdutos(produtosCarregados);
        return;
    }
    renderizarProdutos(produtosCarregados.filter((produto) => produto.idCategoria === idCategoria));
}

function abrirModalPedido(idProduto) {
    const produto = produtosCarregados.find((item) => item.id === idProduto);
    if (!produto) return;

    document.getElementById('pedidoForm').reset();
    document.getElementById('pedido-id-produto').value = produto.id;
    document.getElementById('pedido-produto-nome').textContent = produto.nome;
    document.getElementById('pedido-produto-preco').textContent = formatarPreco(produto.preco);
    document.getElementById('pedido-endereco-container').hidden = true;

    new bootstrap.Modal(document.getElementById('pedidoModal')).show();
}

async function confirmarPedido() {
    const form = document.getElementById('pedidoForm');
    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }

    const pedido = {
        idUsuario: document.getElementById('pedido-id-usuario').value,
        tipoEntrega: document.getElementById('pedido-tipo-entrega').value,
        endereco: document.getElementById('pedido-endereco').value || null,
        formaPagamento: document.getElementById('pedido-forma-pagamento').value,
        telefone: document.getElementById('pedido-telefone').value,
        itens: [{
            idProduto: document.getElementById('pedido-id-produto').value,
            quantidade: parseInt(document.getElementById('pedido-quantidade').value, 10)
        }]
    };

    const botao = document.getElementById('btnConfirmarPedido');
    botao.disabled = true;
    try {
        await window.api.criarPedido(pedido);
        bootstrap.Modal.getInstance(document.getElementById('pedidoModal')).hide();
        mostrarAlerta('Pedido realizado com sucesso!', 'success');
    } catch (erro) {
        mostrarAlerta(`Erro ao criar o pedido: ${erro.message}`, 'danger');
    } finally {
        botao.disabled = false;
    }
}
