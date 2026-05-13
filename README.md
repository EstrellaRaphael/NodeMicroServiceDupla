# Node Microservice Dupla

Monorepo com três microsserviços em Node.js + TypeScript + Fastify, orquestrados via Docker Compose.

## Arquitetura

```
cliente
  └── API Gateway :3000
        ├── /products  →  Product Service :3001
        └── /orders    →  Order Service :3002
                               └── consulta Product Service via HTTP
```

| Serviço | Porta | Responsabilidade |
|:--------|:------|:-----------------|
| api-gateway | 3000 | Ponto de entrada único — faz proxy para os demais serviços |
| product-service | 3001 | Catálogo de produtos (dados em memória) |
| order-service | 3002 | Criação de pedidos — enriquece com dados do product-service |

## Estrutura do repositório

```
/
├── package.json          # npm workspaces
├── tsconfig.json         # config TypeScript base
├── docker-compose.yml
└── apps/
    ├── product-service/
    │   ├── Dockerfile
    │   └── src/server.ts
    ├── order-service/
    │   ├── Dockerfile
    │   └── src/server.ts
    └── api-gateway/
        ├── Dockerfile
        └── src/server.ts
```

## Rodando localmente

### Pré-requisitos

- Node.js 20+
- npm 9+

### Instalar dependências

```bash
npm install
```

### Subir os serviços (cada um em um terminal)

```bash
# Terminal 1
npm run product

# Terminal 2
npm run order

# Terminal 3
npm run gateway
```

## Rodando com Docker

```bash
docker-compose up --build
```

Para encerrar:

```bash
docker-compose down
```

## Endpoints

### API Gateway (porta 3000)

| Método | Rota | Descrição |
|:-------|:-----|:----------|
| GET | /health | Health check do gateway |
| GET | /products | Lista todos os produtos |
| GET | /products/:id | Busca produto por ID |
| GET | /orders | Lista todos os pedidos |
| POST | /orders | Cria um pedido |

### Exemplos

```bash
# Listar produtos
curl http://localhost:3000/products

# Buscar produto por ID
curl http://localhost:3000/products/1

# Criar pedido
curl -X POST http://localhost:3000/orders \
  -H "Content-Type: application/json" \
  -d '{"productId": 1, "quantity": 3}'

# Health check
curl http://localhost:3000/health
```

Resposta de `POST /orders`:

```json
{
  "id": 1,
  "productId": 1,
  "productName": "Notebook Pro",
  "quantity": 3,
  "total": 10500,
  "createdAt": "2024-01-01T00:00:00.000Z"
}
```

## Variáveis de ambiente

| Serviço | Variável | Padrão (dev) | Valor no Docker |
|:--------|:---------|:-------------|:----------------|
| order-service | `PRODUCT_SERVICE_URL` | — | `http://product-service:3001` |
| api-gateway | `PRODUCT_SERVICE_URL` | `http://localhost:3001` | `http://product-service:3001` |
| api-gateway | `ORDER_SERVICE_URL` | `http://localhost:3002` | `http://order-service:3002` |

## Stack

- **Runtime:** Node.js 20
- **Framework:** Fastify 4
- **Linguagem:** TypeScript 5
- **Proxy:** @fastify/http-proxy
- **Containers:** Docker + Docker Compose
- **Workspaces:** npm workspaces
