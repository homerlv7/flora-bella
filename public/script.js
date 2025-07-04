// JavaScript para Sistema de Gestão de Floricultura

// Configuração da API
const API_URL = 'http://localhost:3001/api/produtos';

// Elementos do DOM
const form = document.getElementById('produto-form');
const formTitulo = document.getElementById('form-titulo');
const btnSalvar = document.getElementById('btn-salvar');
const btnCancelar = document.getElementById('btn-cancelar');
const listaProdutos = document.getElementById('lista-produtos');
const semProdutos = document.getElementById('sem-produtos');
const modal = document.getElementById('modal');
const modalVenda = document.getElementById('modal-venda');
const confirmarExclusao = document.getElementById('confirmar-exclusao');
const cancelarExclusao = document.getElementById('cancelar-exclusao');
const confirmarVenda = document.getElementById('confirmar-venda');
const notificacao = document.getElementById('notificacao');
const searchInput = document.getElementById('search-input');

// Variáveis de controle
let editandoId = null;
let excluindoId = null;
let vendendoId = null;
let produtosCache = []; // Cache local dos produtos
let filtroAtual = 'todos';

// Emojis por categoria
const emojisCategorias = {
    'Flores Cortadas': '🌹',
    'Plantas em Vaso': '🪴',
    'Arranjos Florais': '💐',
    'Buquês': '💝',
    'Plantas Ornamentais': '🌿',
    'Vasos e Cachepôs': '🏺',
    'Acessórios': '🎀',
    'Sementes e Mudas': '🌱'
};

// Inicialização
document.addEventListener('DOMContentLoaded', function() {
    carregarProdutos();
    configurarEventos();
    definirDataAtual();
});

// Define a data atual no campo de entrada
function definirDataAtual() {
    const dataEntrada = document.getElementById('data-entrada');
    if (dataEntrada) {
        dataEntrada.valueAsDate = new Date();
    }
}

// Configura todos os eventos
function configurarEventos() {
    form.addEventListener('submit', salvarProduto);
    btnCancelar.addEventListener('click', cancelarEdicao);
    confirmarExclusao.addEventListener('click', confirmarExclusaoProduto);
    cancelarExclusao.addEventListener('click', fecharModal);
    confirmarVenda.addEventListener('click', confirmarVendaProduto);
    
    // Fechar modais clicando fora
    modal.addEventListener('click', function(e) {
        if (e.target === modal) fecharModal();
    });
    
    modalVenda.addEventListener('click', function(e) {
        if (e.target === modalVenda) fecharModalVenda();
    });
    
    // Busca em tempo real
    searchInput.addEventListener('input', function(e) {
        realizarBusca(e.target.value);
    });
}

// Calcula dias restantes de durabilidade
function calcularDiasRestantes(dataEntrada, durabilidade) {
    if (!dataEntrada || !durabilidade) return null;
    
    const entrada = new Date(dataEntrada);
    const hoje = new Date();
    const diasPassados = Math.floor((hoje - entrada) / (1000 * 60 * 60 * 24));
    const diasRestantes = durabilidade - diasPassados;
    
    return diasRestantes;
}

// Determina o status de validade
function getStatusValidade(diasRestantes, durabilidade) {
    if (!diasRestantes) return { classe: '', texto: '' };
    
    const percentual = (diasRestantes / durabilidade) * 100;
    
    if (diasRestantes <= 0) {
        return { 
            classe: 'validade-vencida', 
            texto: '🥀 Produto vencido' 
        };
    } else if (percentual <= 30) {
        return { 
            classe: 'validade-proxima', 
            texto: `⚠️ Atenção - ${diasRestantes} dia${diasRestantes > 1 ? 's' : ''} restante${diasRestantes > 1 ? 's' : ''}` 
        };
    } else {
        return { 
            classe: 'validade-ok', 
            texto: `✓ Produto fresco - ${diasRestantes} dias restantes` 
        };
    }
}

// Carrega todos os produtos da API
async function carregarProdutos() {
    try {
        const response = await fetch(API_URL);
        const produtos = await response.json();
        
        if (response.ok) {
            produtosCache = produtos;
            exibirProdutos(produtos);
        } else {
            mostrarNotificacao('❌ Erro ao carregar produtos', 'erro');
        }
    } catch (error) {
        console.error('Erro:', error);
        mostrarNotificacao('🔌 Erro de conexão com o servidor', 'erro');
    }
}

// Exibe a lista de produtos
function exibirProdutos(produtos) {
    if (produtos.length === 0) {
        semProdutos.style.display = 'block';
        listaProdutos.innerHTML = '';
        listaProdutos.appendChild(semProdutos);
        return;
    }
    
    semProdutos.style.display = 'none';
    listaProdutos.innerHTML = '';
    
    produtos.forEach(produto => {
        const item = criarItemProduto(produto);
        listaProdutos.appendChild(item);
    });
}

// Cria um item de produto para a lista
function criarItemProduto(produto) {
    const div = document.createElement('div');
    div.className = 'produto-item';
    
    // Determina o emoji da categoria
    const emoji = emojisCategorias[produto.categoria] || '🌸';
    
    // Determina classe CSS da categoria
    const categoriaClasse = produto.categoria.toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^\w-]/g, '');
    
    // Determina status do estoque
    let statusEstoque = '';
    let statusEstoqueClasse = '';
    if (produto.quantidade <= 0) {
        statusEstoque = 'status-critico';
        statusEstoqueClasse = 'Sem estoque';
    } else if (produto.quantidade <= 5) {
        statusEstoque = 'status-baixo';
        statusEstoqueClasse = 'Estoque baixo';
    }
    
    // Formata data de entrada
    const dataFormatada = produto.data_entrada 
        ? new Date(produto.data_entrada).toLocaleDateString('pt-BR')
        : 'Não informada';
    
    div.innerHTML = `
        <div class="produto-imagem">
            ${emoji}
        </div>
        
        <div class="produto-info">
            <h3>${produto.nome}</h3>
            <span class="categoria-badge categoria-${categoriaClasse}">${emoji} ${produto.categoria}</span>
            <div class="info-grid">
                <p><strong>Entrada:</strong> ${dataFormatada}</p>
            </div>
        </div>
        
        <div class="produto-status">
            <div class="estoque-visual">
                <span class="estoque-numero">${produto.quantidade}</span>
                <span class="estoque-label">unidade${produto.quantidade !== 1 ? 's' : ''}</span>
            </div>
            <span class="status-indicator ${statusEstoque}"></span>
            ${statusEstoqueClasse ? `<small style="color: #6b7280; font-size: 0.75rem;">${statusEstoqueClasse}</small>` : ''}
        </div>
        
        <div class="produto-preco">
            <span class="preco-valor">R$ ${produto.preco_venda.toFixed(2).replace('.', ',')}</span>
            <span class="preco-unidade">por unidade</span>
        </div>
        
        <div class="produto-acoes">
            ${produto.quantidade > 0 ? `<button class="btn-acao btn-vender" onclick="venderProduto(${produto.id})">💰 Vender</button>` : ''}
            <button class="btn-acao btn-editar" onclick="editarProduto(${produto.id})">✏️ Editar</button>
            <button class="btn-acao btn-excluir" onclick="excluirProduto(${produto.id})">🗑️ Excluir</button>
        </div>
    `;
    
    return div;
}

// Salva produto (novo ou editado)
async function salvarProduto(e) {
    e.preventDefault();
    
    const dados = {
        nome: document.getElementById('nome').value.trim(),
        categoria: document.getElementById('categoria').value,
        preco_venda: parseFloat(document.getElementById('preco').value),
        quantidade: parseInt(document.getElementById('quantidade').value),
        data_entrada: document.getElementById('data-entrada').value
    };
    
    // Validação
    if (!dados.nome || !dados.preco_venda || !dados.categoria || dados.quantidade < 0) {
        mostrarNotificacao('❌ Preencha todos os campos obrigatórios', 'erro');
        return;
    }
    
    if (dados.preco_venda <= 0) {
        mostrarNotificacao('❌ Preço de venda deve ser maior que zero', 'erro');
        return;
    }
    
    try {
        let response;
        
        if (editandoId) {
            // Atualizar produto existente
            response = await fetch(`${API_URL}/${editandoId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(dados)
            });
        } else {
            // Criar novo produto
            response = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(dados)
            });
        }
        
        const resultado = await response.json();
        
        if (response.ok) {
            mostrarNotificacao(
                editandoId ? '🌸 Produto atualizado com sucesso!' : '🌸 Produto cadastrado com sucesso!', 
                'sucesso'
            );
            limparFormulario();
            carregarProdutos();
        } else {
            mostrarNotificacao(`❌ ${resultado.erro}`, 'erro');
        }
        
    } catch (error) {
        console.error('Erro:', error);
        mostrarNotificacao('❌ Erro ao salvar produto', 'erro');
    }
}

// Prepara formulário para edição
async function editarProduto(id) {
    // Busca o produto no cache
    const produto = produtosCache.find(p => p.id === id);
    
    if (!produto) {
        // Se não encontrar no cache, busca na API
        try {
            const response = await fetch(`${API_URL}/${id}`);
            if (response.ok) {
                const produto = await response.json();
                preencherFormulario(produto);
            } else {
                mostrarNotificacao('❌ Produto não encontrado', 'erro');
                return;
            }
        } catch (error) {
            mostrarNotificacao('❌ Erro ao buscar produto', 'erro');
            return;
        }
    } else {
        preencherFormulario(produto);
    }
    
    // Atualiza interface
    editandoId = id;
    formTitulo.textContent = 'Editar Produto';
    btnSalvar.innerHTML = '💐 Atualizar Produto';
    btnCancelar.style.display = 'block';
    
    // Scroll para o formulário
    document.querySelector('.form-card').scrollIntoView({ behavior: 'smooth' });
}

// Preenche o formulário com os dados do produto
function preencherFormulario(produto) {
    document.getElementById('nome').value = produto.nome || '';
    document.getElementById('categoria').value = produto.categoria || '';
    document.getElementById('preco').value = produto.preco_venda || '';
    document.getElementById('quantidade').value = produto.quantidade || 0;
    document.getElementById('data-entrada').value = produto.data_entrada || '';
}

// Cancela edição
function cancelarEdicao() {
    limparFormulario();
}

// Limpa e reseta o formulário
function limparFormulario() {
    form.reset();
    editandoId = null;
    formTitulo.textContent = 'Cadastrar Produto';
    btnSalvar.innerHTML = '💐 Cadastrar Produto';
    btnCancelar.style.display = 'none';
    definirDataAtual();
}

// Prepara exclusão de produto
function excluirProduto(id) {
    excluindoId = id;
    modal.style.display = 'block';
    
    // Adiciona animação ao abrir
    setTimeout(() => {
        modal.querySelector('.modal-conteudo').style.animation = 'bloomIn 0.3s ease';
    }, 10);
}

// Confirma exclusão do produto
async function confirmarExclusaoProduto() {
    if (!excluindoId) return;
    
    try {
        const response = await fetch(`${API_URL}/${excluindoId}`, {
            method: 'DELETE'
        });
        
        const resultado = await response.json();
        
        if (response.ok) {
            mostrarNotificacao('🥀 Produto excluído com sucesso', 'sucesso');
            carregarProdutos();
        } else {
            mostrarNotificacao(`❌ ${resultado.erro}`, 'erro');
        }
        
    } catch (error) {
        console.error('Erro:', error);
        mostrarNotificacao('❌ Erro ao excluir produto', 'erro');
    } finally {
        fecharModal();
    }
}

// Fecha modal de confirmação
function fecharModal() {
    modal.style.display = 'none';
    excluindoId = null;
}

// Mostra notificação
function mostrarNotificacao(mensagem, tipo) {
    notificacao.textContent = mensagem;
    notificacao.className = `notificacao ${tipo} mostrar`;
    
    setTimeout(() => {
        notificacao.classList.remove('mostrar');
    }, 4000);
}

// Função para filtrar produtos (futura implementação)
function filtrarProdutos(filtro) {
    filtroAtual = filtro;
    
    // Atualizar botões ativos
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');
    
    let produtosFiltrados = [...produtosCache];
    
    // Aplicar filtro de busca se houver
    const termoBusca = searchInput.value.toLowerCase();
    if (termoBusca) {
        produtosFiltrados = produtosFiltrados.filter(p => 
            p.nome.toLowerCase().includes(termoBusca) ||
            p.categoria.toLowerCase().includes(termoBusca)
        );
    }
    
    // Aplicar filtros por categoria
    switch(filtro) {
        case 'flores':
            produtosFiltrados = produtosFiltrados.filter(p => 
                p.categoria === 'Flores Cortadas' || p.categoria === 'Buquês'
            );
            break;
        case 'plantas':
            produtosFiltrados = produtosFiltrados.filter(p => 
                p.categoria === 'Plantas em Vaso' || p.categoria === 'Plantas Ornamentais'
            );
            break;
        case 'arranjos':
            produtosFiltrados = produtosFiltrados.filter(p => 
                p.categoria === 'Arranjos Florais'
            );
            break;
        case 'baixo':
            produtosFiltrados = produtosFiltrados.filter(p => 
                p.quantidade > 0 && p.quantidade <= 5
            );
            break;
    }
    
    exibirProdutos(produtosFiltrados);
}

// Função de busca
function realizarBusca(termo) {
    const termoLower = termo.toLowerCase();
    let produtosFiltrados = [...produtosCache];
    
    if (termoLower) {
        produtosFiltrados = produtosFiltrados.filter(p => 
            p.nome.toLowerCase().includes(termoLower) ||
            p.categoria.toLowerCase().includes(termoLower)
        );
    }
    
    // Aplicar filtro atual se não for "todos"
    if (filtroAtual !== 'todos') {
        switch(filtroAtual) {
            case 'flores':
                produtosFiltrados = produtosFiltrados.filter(p => 
                    p.categoria === 'Flores Cortadas' || p.categoria === 'Buquês'
                );
                break;
            case 'plantas':
                produtosFiltrados = produtosFiltrados.filter(p => 
                    p.categoria === 'Plantas em Vaso' || p.categoria === 'Plantas Ornamentais'
                );
                break;
            case 'arranjos':
                produtosFiltrados = produtosFiltrados.filter(p => 
                    p.categoria === 'Arranjos Florais'
                );
                break;
            case 'baixo':
                produtosFiltrados = produtosFiltrados.filter(p => 
                    p.quantidade > 0 && p.quantidade <= 5
                );
                break;
        }
    }
    
    exibirProdutos(produtosFiltrados);
}

// Função para registrar venda
function venderProduto(id) {
    const produto = produtosCache.find(p => p.id === id);
    if (!produto) return;
    
    vendendoId = id;
    document.getElementById('produto-venda-nome').textContent = produto.nome;
    document.getElementById('estoque-disponivel').textContent = produto.quantidade;
    document.getElementById('quantidade-venda').max = produto.quantidade;
    document.getElementById('quantidade-venda').value = 1;
    
    modalVenda.style.display = 'block';
    setTimeout(() => {
        modalVenda.querySelector('.modal-conteudo').style.animation = 'bloomIn 0.3s ease';
    }, 10);
}

// Confirmar venda
async function confirmarVendaProduto() {
    if (!vendendoId) return;
    
    const quantidade = parseInt(document.getElementById('quantidade-venda').value);
    const produto = produtosCache.find(p => p.id === vendendoId);
    
    if (!produto || quantidade <= 0 || quantidade > produto.quantidade) {
        mostrarNotificacao('❌ Quantidade inválida', 'erro');
        return;
    }
    
    try {
        const response = await fetch(`${API_URL}/${vendendoId}/vender`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ quantidade })
        });
        
        const resultado = await response.json();
        
        if (response.ok) {
            mostrarNotificacao(`💰 Venda registrada! ${quantidade} unidade(s) vendida(s)`, 'sucesso');
            carregarProdutos();
            fecharModalVenda();
        } else {
            mostrarNotificacao(`❌ ${resultado.erro}`, 'erro');
        }
    } catch (error) {
        console.error('Erro:', error);
        mostrarNotificacao('❌ Erro ao registrar venda', 'erro');
    }
}

// Fechar modal de venda
function fecharModalVenda() {
    modalVenda.style.display = 'none';
    vendendoId = null;
}

// Verifica se servidor está rodando
window.addEventListener('load', function() {
    setTimeout(() => {
        fetch(API_URL)
            .catch(() => {
                mostrarNotificacao('🔌 Servidor não está rodando. Execute "npm start"', 'erro');
            });
    }, 1000);
});

// Adiciona atalhos de teclado
document.addEventListener('keydown', function(e) {
    // Ctrl + N para novo produto
    if (e.ctrlKey && e.key === 'n') {
        e.preventDefault();
        limparFormulario();
        document.getElementById('nome').focus();
    }
    
    // ESC para fechar modal ou cancelar edição
    if (e.key === 'Escape') {
        if (modal.style.display === 'block') {
            fecharModal();
        } else if (editandoId) {
            cancelarEdicao();
        }
    }
});