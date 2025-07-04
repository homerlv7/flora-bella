# Documentação da API - Sistema de Gestão de Floricultura

## Informações Gerais

- **URL Base**: `http://localhost:3001`
- **Formato de Dados**: JSON
- **Codificação**: UTF-8
- **Versão**: 1.0.0

---

## Sumário

1. [Recursos Disponíveis](#recursos-disponíveis)
2. [Autenticação](#autenticação)
3. [Códigos de Status HTTP](#códigos-de-status-http)
4. [Endpoints](#endpoints)
   - [Produtos](#produtos)
   - [Vendas](#vendas)
   - [Dashboard e Relatórios](#dashboard-e-relatórios)
5. [Modelos de Dados](#modelos-de-dados)
6. [Exemplos de Uso](#exemplos-de-uso)
7. [Tratamento de Erros](#tratamento-de-erros)

---

## Recursos Disponíveis

O sistema oferece os seguintes recursos através da API REST:

- Gerenciamento completo de produtos (CRUD)
- Registro de vendas com atualização automática de estoque
- Consulta de estatísticas e relatórios
- Histórico de movimentações de estoque
- Filtros e buscas avançadas

---

## Autenticação

A versão atual da API não implementa autenticação. Para uso em produção, recomenda-se a implementação de autenticação via JWT ou OAuth 2.0.

---

## Códigos de Status HTTP

| Código | Descrição | Uso |
|--------|-----------|-----|
| 200 | OK | Requisição processada com sucesso |
| 201 | Created | Recurso criado com sucesso |
| 400 | Bad Request | Dados inválidos ou parâmetros faltando |
| 404 | Not Found | Recurso não encontrado |
| 500 | Internal Server Error | Erro interno do servidor |

---

## Endpoints

### Produtos

#### Listar Todos os Produtos

```
GET /api/produtos
```

**Parâmetros de Query (opcionais)**:

| Parâmetro | Tipo | Descrição |
|-----------|------|-----------|
| categoria | string | Filtra produtos por categoria |
| estoque_baixo | boolean | Se true, retorna apenas produtos com estoque entre 1 e 5 |

**Exemplo de Requisição**:
```
GET /api/produtos?categoria=Flores Cortadas&estoque_baixo=true
```

**Resposta de Sucesso (200 OK)**:
```json
[
  {
    "id": 1,
    "nome": "Rosa Vermelha",
    "categoria": "Flores Cortadas",
    "preco_venda": 12.50,
    "quantidade": 24,
    "data_entrada": "2024-06-20",
    "created_at": "2024-06-20 10:30:00",
    "updated_at": "2024-06-20 10:30:00"
  }
]
```

---

#### Buscar Produto por ID

```
GET /api/produtos/:id
```

**Parâmetros de Rota**:

| Parâmetro | Tipo | Descrição |
|-----------|------|-----------|
| id | integer | ID único do produto |

**Resposta de Sucesso (200 OK)**:
```json
{
  "id": 1,
  "nome": "Rosa Vermelha",
  "categoria": "Flores Cortadas",
  "preco_venda": 12.50,
  "quantidade": 24,
  "data_entrada": "2024-06-20",
  "created_at": "2024-06-20 10:30:00",
  "updated_at": "2024-06-20 10:30:00"
}
```

**Resposta de Erro (404 Not Found)**:
```json
{
  "erro": "Produto não encontrado"
}
```

---

#### Criar Novo Produto

```
POST /api/produtos
```

**Corpo da Requisição**:

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| nome | string | Sim | Nome do produto |
| categoria | string | Sim | Categoria do produto |
| preco_venda | number | Sim | Preço de venda (maior que 0) |
| quantidade | integer | Sim | Quantidade inicial (maior ou igual a 0) |
| data_entrada | string | Não | Data de entrada (formato: YYYY-MM-DD) |

**Exemplo de Requisição**:
```json
{
  "nome": "Orquídea Phalaenopsis",
  "categoria": "Plantas em Vaso",
  "preco_venda": 89.90,
  "quantidade": 10,
  "data_entrada": "2024-06-25"
}
```

**Resposta de Sucesso (200 OK)**:
```json
{
  "id": 2,
  "nome": "Orquídea Phalaenopsis",
  "categoria": "Plantas em Vaso",
  "preco_venda": 89.90,
  "quantidade": 10,
  "data_entrada": "2024-06-25",
  "mensagem": "Produto cadastrado com sucesso!"
}
```

**Resposta de Erro (400 Bad Request)**:
```json
{
  "erro": "Nome, categoria, preço e quantidade são obrigatórios"
}
```

---

#### Atualizar Produto

```
PUT /api/produtos/:id
```

**Parâmetros de Rota**:

| Parâmetro | Tipo | Descrição |
|-----------|------|-----------|
| id | integer | ID único do produto |

**Corpo da Requisição**:

Todos os campos são obrigatórios na atualização:

```json
{
  "nome": "Rosa Vermelha Premium",
  "categoria": "Flores Cortadas",
  "preco_venda": 15.00,
  "quantidade": 30,
  "data_entrada": "2024-06-20"
}
```

**Resposta de Sucesso (200 OK)**:
```json
{
  "mensagem": "Produto atualizado com sucesso!"
}
```

---

#### Excluir Produto

```
DELETE /api/produtos/:id
```

**Parâmetros de Rota**:

| Parâmetro | Tipo | Descrição |
|-----------|------|-----------|
| id | integer | ID único do produto |

**Resposta de Sucesso (200 OK)**:
```json
{
  "mensagem": "Produto excluído com sucesso!"
}
```

---

### Vendas

#### Registrar Venda

```
POST /api/produtos/:id/vender
```

**Parâmetros de Rota**:

| Parâmetro | Tipo | Descrição |
|-----------|------|-----------|
| id | integer | ID do produto a ser vendido |

**Corpo da Requisição**:

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| quantidade | integer | Sim | Quantidade a ser vendida (maior que 0) |

**Exemplo de Requisição**:
```json
{
  "quantidade": 5
}
```

**Resposta de Sucesso (200 OK)**:
```json
{
  "mensagem": "Venda registrada com sucesso!",
  "quantidade_vendida": 5,
  "estoque_atual": 19
}
```

**Resposta de Erro (400 Bad Request)**:
```json
{
  "erro": "Quantidade insuficiente em estoque"
}
```

---

### Dashboard e Relatórios

#### Obter Estatísticas Gerais

```
GET /api/dashboard/stats
```

**Resposta de Sucesso (200 OK)**:
```json
{
  "totalProdutos": 25,
  "valorTotalEstoque": 5420.50,
  "estoqueBaixo": 3,
  "semEstoque": 1
}
```

**Descrição dos Campos**:

| Campo | Descrição |
|-------|-----------|
| totalProdutos | Quantidade total de produtos cadastrados |
| valorTotalEstoque | Valor total do estoque (soma de preço × quantidade) |
| estoqueBaixo | Quantidade de produtos com estoque entre 1 e 5 unidades |
| semEstoque | Quantidade de produtos com estoque zerado |

---

#### Listar Categorias Disponíveis

```
GET /api/categorias
```

**Resposta de Sucesso (200 OK)**:
```json
[
  "Arranjos Florais",
  "Buquês",
  "Flores Cortadas",
  "Plantas em Vaso",
  "Plantas Ornamentais",
  "Vasos e Cachepôs"
]
```

---

#### Consultar Histórico de Movimentações

```
GET /api/produtos/:id/historico
```

**Parâmetros de Rota**:

| Parâmetro | Tipo | Descrição |
|-----------|------|-----------|
| id | integer | ID do produto |

**Resposta de Sucesso (200 OK)**:
```json
[
  {
    "id": 5,
    "produto_id": 1,
    "quantidade_anterior": 30,
    "quantidade_nova": 25,
    "tipo_movimentacao": "VENDA",
    "observacao": "Venda de 5 unidade(s)",
    "data_movimentacao": "2024-06-25 14:30:00"
  },
  {
    "id": 1,
    "produto_id": 1,
    "quantidade_anterior": 0,
    "quantidade_nova": 30,
    "tipo_movimentacao": "ENTRADA",
    "observacao": "Cadastro inicial",
    "data_movimentacao": "2024-06-20 10:30:00"
  }
]
```

---

## Modelos de Dados

### Produto

```typescript
interface Produto {
  id: number;
  nome: string;
  categoria: string;
  preco_venda: number;
  quantidade: number;
  data_entrada: string;
  created_at: string;
  updated_at: string;
}
```

### Histórico de Estoque

```typescript
interface HistoricoEstoque {
  id: number;
  produto_id: number;
  quantidade_anterior: number;
  quantidade_nova: number;
  tipo_movimentacao: "ENTRADA" | "SAIDA" | "VENDA";
  observacao: string;
  data_movimentacao: string;
}
```

---

## Exemplos de Uso

### Usando cURL

#### Cadastrar um novo produto:
```bash
curl -X POST http://localhost:3001/api/produtos \
  -H "Content-Type: application/json" \
  -d '{
    "nome": "Girassol",
    "categoria": "Flores Cortadas",
    "preco_venda": 8.50,
    "quantidade": 50
  }'
```

#### Registrar uma venda:
```bash
curl -X POST http://localhost:3001/api/produtos/1/vender \
  -H "Content-Type: application/json" \
  -d '{
    "quantidade": 3
  }'
```

#### Buscar produtos com estoque baixo:
```bash
curl "http://localhost:3001/api/produtos?estoque_baixo=true"
```

### Usando JavaScript (Fetch API)

#### Listar todos os produtos:
```javascript
fetch('http://localhost:3001/api/produtos')
  .then(response => response.json())
  .then(produtos => console.log(produtos))
  .catch(error => console.error('Erro:', error));
```

#### Criar novo produto:
```javascript
fetch('http://localhost:3001/api/produtos', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    nome: 'Tulipa Amarela',
    categoria: 'Flores Cortadas',
    preco_venda: 15.00,
    quantidade: 20
  })
})
.then(response => response.json())
.then(data => console.log(data))
.catch(error => console.error('Erro:', error));
```

---

## Tratamento de Erros

Todos os erros retornam um objeto JSON com a seguinte estrutura:

```json
{
  "erro": "Descrição do erro"
}
```

### Erros Comuns

| Código | Erro | Causa |
|--------|------|-------|
| 400 | "Nome, categoria, preço e quantidade são obrigatórios" | Campos obrigatórios não fornecidos |
| 400 | "Preço de venda deve ser maior que zero" | Preço inválido |
| 400 | "Quantidade não pode ser negativa" | Quantidade inválida |
| 400 | "Quantidade insuficiente em estoque" | Tentativa de vender mais do que disponível |
| 404 | "Produto não encontrado" | ID do produto não existe |
| 500 | "Erro ao [ação]" | Erro interno do servidor |

---

## Categorias de Produtos

O sistema suporta as seguintes categorias:

| Categoria | Descrição |
|-----------|-----------|
| Flores Cortadas | Flores individuais para arranjos |
| Plantas em Vaso | Plantas ornamentais em vasos |
| Arranjos Florais | Arranjos prontos |
| Buquês | Buquês montados |
| Plantas Ornamentais | Plantas decorativas |
| Vasos e Cachepôs | Recipientes para plantas |
| Acessórios | Itens complementares |
| Sementes e Mudas | Material para plantio |

---

## Considerações de Segurança

1. **CORS**: Atualmente configurado para aceitar requisições de qualquer origem. Em produção, restringir aos domínios autorizados.

2. **Validação de Entrada**: Todos os dados de entrada são validados no servidor antes do processamento.

3. **SQL Injection**: Utilização de prepared statements para prevenir injeção SQL.

4. **Autenticação**: Não implementada na versão atual. Recomenda-se implementar antes do deploy em produção.

---

## Limitações Conhecidas

1. Não há paginação implementada para listagem de produtos
2. Ausência de sistema de autenticação e autorização
3. Banco de dados SQLite não recomendado para alta concorrência
4. Sem suporte para upload de imagens de produtos
5. Histórico limitado aos últimos 20 registros por produto

---

## Requisitos do Sistema

- Node.js versão 14.0 ou superior
- NPM versão 6.0 ou superior
- SQLite3

### Dependências

```json
{
  "dependencies": {
    "express": "^4.18.0",
    "sqlite3": "^5.1.0"
  }
}
```

---

## Instalação e Execução

1. Clone o repositório do projeto
2. Instale as dependências:
   ```bash
   npm install
   ```
3. Execute o servidor:
   ```bash
   node server.js
   ```
4. O servidor estará disponível em `http://localhost:3001`

---

## Contato e Suporte

Para dúvidas ou sugestões sobre a API, entre em contato com a equipe de desenvolvimento.

**Versão**: 1.0.0  
**Última Atualização**: Julho de 2025  
**Autor**: Lucas Pires de Oliveira