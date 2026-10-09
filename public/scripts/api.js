/**
 * api.js
 * Ponto único de comunicação com o back-end da Cantina da Nonna.
 * Toda rota de listagem devolve o formato { content, page, size, totalElements } --
 * é o mesmo PageDto usado em todos os domínios do back, então paginamos
 * sempre da mesma forma, em qualquer tela.
 */

const API_BASE_URL = 'http://localhost:8080';

async function fetchAPI(endpoint, method = 'GET', body = null) {
    const sessao = obterSessao();
    const config = {
        method,
        headers: {
            'Content-Type': 'application/json',
            // Se há sessão, todo request já sai autenticado -- é assim que
            // o back sabe "quem" está pedindo, sem precisar mandar o id.
            ...(sessao ? { Authorization: `Bearer ${sessao.token}` } : {})
        }
    };
    if (body !== null) config.body = JSON.stringify(body);

    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);

    if (response.status === 204) return null;

    const data = await response.json();

    if (!response.ok) {
        if (response.status === 401 && sessao) {
            // Token expirado ou inválido: limpa a sessão local para a
            // próxima ação já mandar pedir login de novo.
            limparSessao();
        }
        // O back devolve { status, erros: [...], horario }
        const mensagem = Array.isArray(data.erros) ? data.erros.join(', ') : 'Erro inesperado';
        throw new Error(mensagem);
    }

    return data;
}

window.api = {
    // Autenticação
    login: (email, senha) => fetchAPI('/auth/login', 'POST', { email, senha }),
    me: () => fetchAPI('/me'),

    // Categorias
    getCategorias: (page = 0, size = 100) => fetchAPI(`/categorias?page=${page}&size=${size}`),
    criarCategoria: (categoria) => fetchAPI('/categorias', 'POST', categoria),
    atualizarCategoria: (id, categoria) => fetchAPI(`/categorias/${id}`, 'PUT', categoria),
    removerCategoria: (id) => fetchAPI(`/categorias/${id}`, 'DELETE'),

    // Produtos
    getProdutos: (page = 0, size = 100, idCategoria = null) =>
        fetchAPI(`/produtos?page=${page}&size=${size}${idCategoria ? `&idCategoria=${idCategoria}` : ''}`),
    getProduto: (id) => fetchAPI(`/produtos/${id}`),
    criarProduto: (produto) => fetchAPI('/produtos', 'POST', produto),
    atualizarProduto: (id, produto) => fetchAPI(`/produtos/${id}`, 'PUT', produto),
    removerProduto: (id) => fetchAPI(`/produtos/${id}`, 'DELETE'),

    // Usuários
    getUsuarios: (page = 0, size = 100) => fetchAPI(`/usuarios?page=${page}&size=${size}`),
    getUsuario: (id) => fetchAPI(`/usuarios/${id}`),
    criarUsuario: (usuario) => fetchAPI('/usuarios', 'POST', usuario),
    atualizarUsuario: (id, usuario) => fetchAPI(`/usuarios/${id}`, 'PUT', usuario),

    // Reservas
    criarReserva: (reserva) => fetchAPI('/reservas', 'POST', reserva),
    getReservas: (page = 0, size = 30) => fetchAPI(`/reservas?page=${page}&size=${size}`),
    cancelarReserva: (id, motivo) => fetchAPI(`/reservas/${id}/cancelar`, 'POST', { motivo }),

    // Pedidos
    criarPedido: (pedido) => fetchAPI('/pedidos', 'POST', pedido),
    getPedidos: (page = 0, size = 30) => fetchAPI(`/pedidos?page=${page}&size=${size}`),
    getPedido: (id) => fetchAPI(`/pedidos/${id}`),
    atualizarPedido: (id, dados) => fetchAPI(`/pedidos/${id}`, 'PUT', dados),
    cancelarPedido: (id, motivo) => fetchAPI(`/pedidos/${id}/cancelar`, 'POST', { motivo })
};
