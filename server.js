// Servidor para Sistema de Gestão de Floricultura
const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();
const PORT = 3001;

// Configurações básicas
app.use(express.json());
app.use(express.static('public'));

// Conecta com banco SQLite
const db = new sqlite3.Database('./floricultura.db', (err) => {
  if (err) {
    console.error('❌ Erro ao conectar:', err.message);
  } else {
    console.log('✅ Banco de dados conectado!');
    
    // Cria tabela de produtos para floricultura
    db.run(`CREATE TABLE IF NOT EXISTS produtos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nome TEXT NOT NULL,
      categoria TEXT NOT NULL,
      preco_venda REAL NOT NULL,
      quantidade INTEGER NOT NULL DEFAULT 0,
      data_entrada DATE DEFAULT CURRENT_DATE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`, (err) => {
      if (err) {
        console.error('❌ Erro ao criar tabela:', err.message);
      } else {
        console.log('✅ Tabela de produtos verificada/criada');
        
        // Trigger para atualizar updated_at
        db.run(`CREATE TRIGGER IF NOT EXISTS update_produtos_timestamp 
                AFTER UPDATE ON produtos
                BEGIN
                  UPDATE produtos SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
                END;`);
      }
    });
    
    // Cria tabela de histórico de estoque
    db.run(`CREATE TABLE IF NOT EXISTS estoque_historico (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      produto_id INTEGER,
      quantidade_anterior INTEGER,
      quantidade_nova INTEGER,
      tipo_movimentacao TEXT,
      observacao TEXT,
      data_movimentacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (produto_id) REFERENCES produtos(id)
    )`);
  }
});

// Middleware para CORS (desenvolvimento)
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  next();
});

// ROTAS DA API

// Listar todos os produtos
app.get('/api/produtos', (req, res) => {
  const { categoria, estoque_baixo } = req.query;
  
  let query = `SELECT * FROM produtos WHERE 1=1`;
  const params = [];
  
  // Filtros opcionais
  if (categoria) {
    query += ' AND categoria = ?';
    params.push(categoria);
  }
  
  if (estoque_baixo === 'true') {
    query += ' AND quantidade > 0 AND quantidade <= 5';
  }
  
  query += ' ORDER BY nome';
  
  db.all(query, params, (err, rows) => {
    if (err) {
      console.error('Erro ao buscar produtos:', err);
      res.status(500).json({ erro: 'Erro ao buscar produtos' });
    } else {
      res.json(rows);
    }
  });
});

// Buscar um produto específico
app.get('/api/produtos/:id', (req, res) => {
  const { id } = req.params;
  
  db.get('SELECT * FROM produtos WHERE id = ?', [id], (err, row) => {
    if (err) {
      res.status(500).json({ erro: 'Erro ao buscar produto' });
    } else if (!row) {
      res.status(404).json({ erro: 'Produto não encontrado' });
    } else {
      res.json(row);
    }
  });
});

// Adicionar novo produto
app.post('/api/produtos', (req, res) => {
  const {
    nome,
    categoria,
    preco_venda,
    quantidade,
    data_entrada
  } = req.body;
  
  // Validação
  if (!nome || !categoria || !preco_venda || quantidade === undefined) {
    return res.status(400).json({ erro: 'Nome, categoria, preço e quantidade são obrigatórios' });
  }
  
  if (preco_venda <= 0) {
    return res.status(400).json({ erro: 'Preço de venda deve ser maior que zero' });
  }
  
  if (quantidade < 0) {
    return res.status(400).json({ erro: 'Quantidade não pode ser negativa' });
  }
  
  const query = `
    INSERT INTO produtos (nome, categoria, preco_venda, quantidade, data_entrada) 
    VALUES (?, ?, ?, ?, ?)
  `;
  
  const params = [
    nome,
    categoria,
    preco_venda,
    quantidade,
    data_entrada || new Date().toISOString().split('T')[0]
  ];
  
  db.run(query, params, function(err) {
    if (err) {
      console.error('Erro ao salvar produto:', err);
      res.status(500).json({ erro: 'Erro ao salvar produto' });
    } else {
      // Registra no histórico
      if (quantidade > 0) {
        db.run(
          `INSERT INTO estoque_historico (produto_id, quantidade_anterior, quantidade_nova, tipo_movimentacao, observacao)
           VALUES (?, 0, ?, 'ENTRADA', 'Cadastro inicial')`,
          [this.lastID, quantidade]
        );
      }
      
      res.json({ 
        id: this.lastID,
        ...req.body,
        mensagem: 'Produto cadastrado com sucesso!' 
      });
    }
  });
});

// Atualizar produto
app.put('/api/produtos/:id', (req, res) => {
  const { id } = req.params;
  const {
    nome,
    categoria,
    preco_venda,
    quantidade,
    data_entrada
  } = req.body;
  
  // Validação
  if (!nome || !categoria || !preco_venda || quantidade === undefined) {
    return res.status(400).json({ erro: 'Nome, categoria, preço e quantidade são obrigatórios' });
  }
  
  if (preco_venda <= 0) {
    return res.status(400).json({ erro: 'Preço de venda deve ser maior que zero' });
  }
  
  if (quantidade < 0) {
    return res.status(400).json({ erro: 'Quantidade não pode ser negativa' });
  }
  
  // Busca quantidade anterior para histórico
  db.get('SELECT quantidade FROM produtos WHERE id = ?', [id], (err, row) => {
    if (err) {
      return res.status(500).json({ erro: 'Erro ao buscar produto' });
    }
    
    if (!row) {
      return res.status(404).json({ erro: 'Produto não encontrado' });
    }
    
    const quantidadeAnterior = row.quantidade;
    
    const query = `
      UPDATE produtos SET 
        nome = ?, 
        categoria = ?, 
        preco_venda = ?, 
        quantidade = ?, 
        data_entrada = ?
      WHERE id = ?
    `;
    
    const params = [
      nome,
      categoria,
      preco_venda,
      quantidade,
      data_entrada,
      id
    ];
    
    db.run(query, params, function(err) {
      if (err) {
        console.error('Erro ao atualizar produto:', err);
        res.status(500).json({ erro: 'Erro ao atualizar produto' });
      } else if (this.changes === 0) {
        res.status(404).json({ erro: 'Produto não encontrado' });
      } else {
        // Registra mudança de estoque no histórico
        if (quantidadeAnterior !== quantidade) {
          const tipo = quantidade > quantidadeAnterior ? 'ENTRADA' : 'SAIDA';
          db.run(
            `INSERT INTO estoque_historico (produto_id, quantidade_anterior, quantidade_nova, tipo_movimentacao, observacao)
             VALUES (?, ?, ?, ?, 'Atualização manual')`,
            [id, quantidadeAnterior, quantidade, tipo]
          );
        }
        
        res.json({ mensagem: 'Produto atualizado com sucesso!' });
      }
    });
  });
});

// Registrar venda
app.post('/api/produtos/:id/vender', (req, res) => {
  const { id } = req.params;
  const { quantidade } = req.body;
  
  if (!quantidade || quantidade <= 0) {
    return res.status(400).json({ erro: 'Quantidade deve ser maior que zero' });
  }
  
  // Busca o produto atual
  db.get('SELECT * FROM produtos WHERE id = ?', [id], (err, produto) => {
    if (err) {
      return res.status(500).json({ erro: 'Erro ao buscar produto' });
    }
    
    if (!produto) {
      return res.status(404).json({ erro: 'Produto não encontrado' });
    }
    
    if (produto.quantidade < quantidade) {
      return res.status(400).json({ erro: 'Quantidade insuficiente em estoque' });
    }
    
    const novaQuantidade = produto.quantidade - quantidade;
    
    // Atualiza a quantidade
    db.run(
      'UPDATE produtos SET quantidade = ? WHERE id = ?',
      [novaQuantidade, id],
      function(err) {
        if (err) {
          return res.status(500).json({ erro: 'Erro ao atualizar estoque' });
        }
        
        // Registra no histórico
        db.run(
          `INSERT INTO estoque_historico (produto_id, quantidade_anterior, quantidade_nova, tipo_movimentacao, observacao)
           VALUES (?, ?, ?, 'VENDA', ?)`,
          [id, produto.quantidade, novaQuantidade, `Venda de ${quantidade} unidade(s)`],
          (err) => {
            if (err) {
              console.error('Erro ao registrar histórico:', err);
            }
          }
        );
        
        res.json({ 
          mensagem: 'Venda registrada com sucesso!',
          quantidade_vendida: quantidade,
          estoque_atual: novaQuantidade
        });
      }
    );
  });
});

// Excluir produto
app.delete('/api/produtos/:id', (req, res) => {
  const { id } = req.params;
  
  // Primeiro exclui o histórico
  db.run('DELETE FROM estoque_historico WHERE produto_id = ?', [id], (err) => {
    if (err) {
      return res.status(500).json({ erro: 'Erro ao excluir histórico do produto' });
    }
    
    // Depois exclui o produto
    db.run('DELETE FROM produtos WHERE id = ?', [id], function(err) {
      if (err) {
        res.status(500).json({ erro: 'Erro ao excluir produto' });
      } else if (this.changes === 0) {
        res.status(404).json({ erro: 'Produto não encontrado' });
      } else {
        res.json({ mensagem: 'Produto excluído com sucesso!' });
      }
    });
  });
});

// ROTAS ADICIONAIS

// Dashboard - Estatísticas
app.get('/api/dashboard/stats', (req, res) => {
  const stats = {};
  
  // Total de produtos
  db.get('SELECT COUNT(*) as total FROM produtos', (err, row) => {
    if (err) return res.status(500).json({ erro: 'Erro ao buscar estatísticas' });
    stats.totalProdutos = row.total;
    
    // Valor total do estoque
    db.get('SELECT SUM(preco_venda * quantidade) as valor_total FROM produtos', (err, row) => {
      if (err) return res.status(500).json({ erro: 'Erro ao buscar estatísticas' });
      stats.valorTotalEstoque = row.valor_total || 0;
      
      // Produtos com estoque baixo
      db.get('SELECT COUNT(*) as total FROM produtos WHERE quantidade > 0 AND quantidade <= 5', (err, row) => {
        if (err) return res.status(500).json({ erro: 'Erro ao buscar estatísticas' });
        stats.estoqueBaixo = row.total;
        
        // Produtos sem estoque
        db.get('SELECT COUNT(*) as total FROM produtos WHERE quantidade = 0', (err, row) => {
          if (err) return res.status(500).json({ erro: 'Erro ao buscar estatísticas' });
          stats.semEstoque = row.total;
          
          res.json(stats);
        });
      });
    });
  });
});

// Categorias disponíveis
app.get('/api/categorias', (req, res) => {
  db.all('SELECT DISTINCT categoria FROM produtos ORDER BY categoria', (err, rows) => {
    if (err) {
      res.status(500).json({ erro: 'Erro ao buscar categorias' });
    } else {
      res.json(rows.map(r => r.categoria));
    }
  });
});

// Histórico de estoque
app.get('/api/produtos/:id/historico', (req, res) => {
  const { id } = req.params;
  
  db.all(
    `SELECT * FROM estoque_historico 
     WHERE produto_id = ? 
     ORDER BY data_movimentacao DESC 
     LIMIT 20`,
    [id],
    (err, rows) => {
      if (err) {
        res.status(500).json({ erro: 'Erro ao buscar histórico' });
      } else {
        res.json(rows);
      }
    }
  );
});

// Página principal
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Inicia servidor
app.listen(PORT, () => {
  console.log(`🌸 Servidor da Floricultura rodando em http://localhost:${PORT}`);
  console.log('💐 Sistema de Gestão Flora Bella iniciado!');
  console.log('🌺 Pressione Ctrl+C para encerrar');
});

// Fecha banco ao encerrar
process.on('SIGINT', () => {
  db.close((err) => {
    if (err) {
      console.error(err.message);
    }
    console.log('\n🥀 Banco de dados fechado.');
    console.log('👋 Servidor encerrado. Até logo!');
    process.exit(0);
  });
});