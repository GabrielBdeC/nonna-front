/**
 * ui.js
 * Pequenos helpers de interface reaproveitados em várias páginas,
 * para não repetir a mesma função em cada arquivo .js de página.
 */

function mostrarAlerta(mensagem, tipo = 'success') {
    const container = document.getElementById('alert-container');
    if (!container) return;
    container.innerHTML = `
        <div class="alert alert-${tipo} alert-dismissible fade show" role="alert">
            ${mensagem}
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Fechar"></button>
        </div>
    `;
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setTimeout(() => {
        const alertNode = container.querySelector('.alert');
        if (alertNode) bootstrap.Alert.getOrCreateInstance(alertNode).close();
    }, 6000);
}

function formatarPreco(valor) {
    return Number(valor).toFixed(2).replace('.', ',');
}
