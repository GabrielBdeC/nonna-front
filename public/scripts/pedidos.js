/**
 * pedidos.js
 * Lista pedidos em aberto e permite atualizar status ou cancelar.
 */

document.addEventListener('DOMContentLoaded', () => {
    carregarPedidos();
    document.getElementById('btnAtualizarPedido').addEventListener('click', atualizarStatus);
    document.getElementById('btnCancelarPedido').addEventListener('click', cancelarPedido);
});

async function carregarPedidos() {
    const corpo = document.getElementById('pedidos-tbody');
    try {
        const pagina = await window.api.getPedidos();
        renderizarPedidos(pagina.content);
    } catch (erro) {
        corpo.innerHTML = '<tr><td colspan="6" class="text-center">Não foi possível carregar os pedidos.</td></tr>';
    }
}

function renderizarPedidos(pedidos) {
    const corpo = document.getElementById('pedidos-tbody');
    corpo.innerHTML = '';

    if (pedidos.length === 0) {
        corpo.innerHTML = '<tr><td colspan="6" class="text-center">Nenhum pedido em aberto.</td></tr>';
        return;
    }

    pedidos.forEach((pedido) => {
        const linha = document.createElement('tr');
        linha.innerHTML = `
            <td>${new Date(pedido.horarioCriacao).toLocaleString('pt-BR')}</td>
            <td>${pedido.idUsuario}</td>
            <td>${pedido.tipoEntrega}</td>
            <td>R$ ${formatarPreco(pedido.precoTotal)}</td>
            <td>${pedido.status}</td>
            <td><button type="button" class="btn btn-sm btn-nonna">Ver</button></td>
        `;
        linha.querySelector('button').onclick = () => abrirDetalhe(pedido.id);
        corpo.appendChild(linha);
    });
}

async function abrirDetalhe(id) {
    try {
        const pedido = await window.api.getPedido(id);

        document.getElementById('detalhe-id').value = pedido.id;
        document.getElementById('detalhe-usuario').textContent = pedido.idUsuario;
        document.getElementById('detalhe-entrega').textContent = `${pedido.tipoEntrega}${pedido.endereco ? ' — ' + pedido.endereco : ''}`;
        document.getElementById('detalhe-telefone').textContent = pedido.telefone;
        document.getElementById('detalhe-pagamento').textContent = pedido.formaPagamento;
        document.getElementById('detalhe-status').value = pedido.status;
        document.getElementById('detalhe-total').textContent = formatarPreco(pedido.precoTotal);

        const corpoItens = document.getElementById('detalhe-itens');
        corpoItens.innerHTML = '';
        pedido.itens.forEach((item) => {
            const linha = document.createElement('tr');
            linha.innerHTML = `
                <td>${item.idProduto}</td>
                <td>${item.quantidade}</td>
                <td>R$ ${formatarPreco(item.precoUnitario)}</td>
                <td>R$ ${formatarPreco(item.subtotal)}</td>
            `;
            corpoItens.appendChild(linha);
        });

        new bootstrap.Modal(document.getElementById('pedidoModal')).show();
    } catch (erro) {
        mostrarAlerta(`Não foi possível abrir o pedido: ${erro.message}`, 'danger');
    }
}

async function atualizarStatus() {
    const id = document.getElementById('detalhe-id').value;
    const horarioSaida = document.getElementById('detalhe-horario-saida').value;
    const horarioFinalizacao = document.getElementById('detalhe-horario-finalizacao').value;

    const dados = {
        status: document.getElementById('detalhe-status').value,
        horarioSaida: horarioSaida ? `${horarioSaida}:00` : null,
        horarioFinalizacao: horarioFinalizacao ? `${horarioFinalizacao}:00` : null
    };

    try {
        await window.api.atualizarPedido(id, dados);
        bootstrap.Modal.getInstance(document.getElementById('pedidoModal')).hide();
        mostrarAlerta('Pedido atualizado.', 'success');
        await carregarPedidos();
    } catch (erro) {
        mostrarAlerta(`Erro ao atualizar pedido: ${erro.message}`, 'danger');
    }
}

async function cancelarPedido() {
    const id = document.getElementById('detalhe-id').value;
    const motivo = prompt('Motivo do cancelamento:');
    if (motivo === null) return;

    try {
        await window.api.cancelarPedido(id, motivo);
        bootstrap.Modal.getInstance(document.getElementById('pedidoModal')).hide();
        mostrarAlerta('Pedido cancelado.', 'success');
        await carregarPedidos();
    } catch (erro) {
        mostrarAlerta(`Erro ao cancelar pedido: ${erro.message}`, 'danger');
    }
}
