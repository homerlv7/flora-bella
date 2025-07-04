# 🛒 Cadastro de Produtos - Mercado

Sistema web simples para cadastrar produtos de mercado usando **JavaScript puro** e **Node.js**.

## 🎯 Objetivo

Projeto didático que demonstra:
- Frontend com HTML, CSS e JavaScript puro
- Backend com Node.js e Express
- Comunicação via Fetch API
- Banco de dados SQLite
- Operações CRUD básicas

## 🚀 Como usar

### 1. Instalar dependências
```bash
npm install
```

### 2. Iniciar servidor
```bash
npm start
```

### 3. Acessar aplicação
Abra o navegador em: `http://localhost:3001`

## 📋 Funcionalidades

- ✅ Cadastrar produtos (nome, preço, categoria)
- ✅ Listar todos os produtos
- ✅ Editar produtos existentes
- ✅ Excluir produtos
- ✅ Categorias pré-definidas para mercado
- ✅ Interface responsiva
- ✅ Validações básicas

## 🗂️ Categorias disponíveis

- Grãos e Cereais
- Carnes
- Laticínios
- Frutas
- Verduras
- Bebidas
- Limpeza
- Higiene
- Outros

## 🛠️ Tecnologias

**Backend:**
- Node.js
- Express.js
- SQLite3

**Frontend:**
- HTML5
- CSS3
- JavaScript (Fetch API)

## 📁 Estrutura

```
projeto/
├── package.json
├── server.js          # Servidor Node.js
├── produtos.db        # Banco SQLite (criado automaticamente)
├── README.md
└── public/
    ├── index.html     # Interface principal
    ├── style.css      # Estilos
    └── script.js      # Lógica frontend
```

## 🔌 API Endpoints

- `GET /api/produtos` - Lista produtos
- `POST /api/produtos` - Cria produto
- `PUT /api/produtos/:id` - Atualiza produto
- `DELETE /api/produtos/:id` - Exclui produto

## 💡 Exemplo de uso

1. **Cadastrar produto:**
   - Nome: "Arroz Integral 1kg"
   - Preço: 8.50
   - Categoria: "Grãos e Cereais"

2. **Editar:** Clique no botão "✏️ Editar"

3. **Excluir:** Clique no botão "🗑️ Excluir"

## 🎓 Ideal para

- Aprender desenvolvimento web
- Demonstrar conhecimentos básicos
- Base para projetos maiores
- Portfólio de desenvolvedor

---

**Projeto simples e didático para cadastro de produtos de mercado** 🛒