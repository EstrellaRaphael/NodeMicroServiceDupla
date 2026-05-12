# Microserviços com Node.js — AV Guiado

AV prática e incremental para construir uma arquitetura de microserviços com Node.js, TypeScript, Fastify e Docker.

---

Como usar este guia:

Cada branch representa um passo do desenvolvimento. Ao concluir um passo, faça checkout da branch seguinte e leia o GUIA.md que explica o que foi construído e por quê.

git checkout step/01-setup

Coloque o GUIA.md na raiz do projeto e siga as instruções.

---

Roteiro de branches

| Branch | O que você vai aprender |
| :---- | :---- |
| step/01-setup | Estrutura do monorepo com npm workspaces e TypeScript |
| step/02-product-service | Primeiro microserviço com Fastify e rotas REST |
| step/03-order-service | Segundo microserviço independente na própria porta |
| step/04-http-communication | Comunicação HTTP síncrona entre serviços |
| step/05-api-gateway | API Gateway como ponto de entrada único |
| step/06-docker | Containerização com Docker e docker-compose |

---

## Arquitetura final

Cliente (frontend / curl)

        │

        ▼ :3000

   \[ API Gateway \]

   ├── /products/\* ──► :3001 \[ Product Service \]

   └── /orders/\*   ──► :3002 \[ Order Service \]

                                     │

                                     └──► :3001 \[ Product Service \]

 

O cliente faz todas as requisições para o API Gateway (porta 3000). O gateway roteia para o serviço correto. O Order Service consulta o Product Service internamente ao criar pedidos.

---

Stack utilizada

* [Fastify](https://fastify.dev/) — framework HTTP de alta performance para Node.js  
* TypeScript — tipagem estática para contratos claros entre serviços  
* npm Workspaces — gerenciamento de monorepo nativo do npm  
* Docker \+ docker-compose — containerização e orquestração local

---

Pré-requisitos

* Node.js 20+  
* npm 10+  
* Docker Desktop (apenas para o passo 6\)

---

Começar

Crie a Branch step/01-setup

Leia o GUIA.md e siga em frente.

 

# 

# **Branch 01**

 

Passo 1 — Configuração do Monorepo

Vamos começar a AV Prática de microserviços com Node.js\!

Neste passo você vai configurar a estrutura base do projeto usando npm workspaces, uma funcionalidade nativa do npm que permite gerenciar múltiplos pacotes em um único repositório (monorepo).

---

Objetivo deste passo

Criar o esqueleto do projeto onde cada microserviço terá sua própria pasta, package.json e configuração TypeScript independente, mas compartilhando a raiz do repositório.

---

O que será criado

/

├── package.json          ← raiz do monorepo (workspaces)

├── tsconfig.json         ← configuração TypeScript base

└── apps/

    └── product-service/

        ├── package.json  ← dependências isoladas do serviço

        └── tsconfig.json ← herda da raiz, sobrescreve outDir

 

---

Por que Monorepo?

Em vez de ter repositórios separados para cada serviço, o monorepo permite:

* Compartilhar código entre serviços (ex: tipos, utilitários)  
* Um único npm install na raiz instala tudo  
* Versionamento unificado — todos os serviços evoluem juntos no mesmo histórico Git

---

npm Workspaces

O campo "workspaces" no package.json raiz instrui o npm a reconhecer todas as pastas dentro de apps/ como pacotes independentes:

{

  "workspaces": \["apps/\*"\]

}

Isso significa que cada serviço tem seu próprio package.json com dependências isoladas.

---

TypeScript Base

O tsconfig.json raiz define as regras que todos os serviços herdarão. Cada serviço tem seu próprio tsconfig.json que usa "extends" para reaproveitar essas configurações:

{

  "extends": "../../tsconfig.json",

  "compilerOptions": {

    "outDir": "dist",

    "rootDir": "src"

  }

}

---

## Próximo passo

Crie a próxima branch para construir o primeiro microserviço:

Crie a Branch step/02-product-service

No próximo passo você vai criar um servidor HTTP com Fastify que expõe endpoints REST para gerenciar produtos.

 

# 

# **Branch 02**

 

## Passo 2 — Product Service

Neste passo você vai criar o primeiro microserviço real: o Product Service. Ele é responsável exclusivamente pelo catálogo de produtos, expondo uma API REST com Fastify.

---

Objetivo deste passo

Construir um servidor HTTP com Fastify que responde a requisições sobre produtos. O foco está em entender a estrutura de um serviço isolado antes de conectá-lo a outros.

---

O que será adicionado

apps/

└── product-service/

    └── src/

        └── server.ts   ← servidor Fastify com rotas de produtos

 

---

## Entendendo o código

1\. Tipagem com TypeScript

Definimos uma interface para garantir que todos os produtos tenham a mesma estrutura:

interface Product {

  id: number;

  name: string;

  price: number;

  stock: number;

}

Por que isso importa? Em um sistema com múltiplos serviços, contratos claros de dados evitam bugs silenciosos quando um serviço muda sua estrutura.

2\. Dados em memória

Por enquanto, os produtos são armazenados em um array em memória. Isso é intencional — o foco é na estrutura do serviço, não no banco de dados.

const products: Product\[\] \= \[

  { id: 1, name: 'Notebook Pro', price: 3500, stock: 10 },

  ...

\];

3\. Rotas REST

Duas rotas simples:

* GET /products — retorna todos os produtos  
* GET /products/:id — retorna um produto pelo ID, ou 404 se não existir

4\. Porta dedicada

O serviço escuta na porta 3001\. Em microserviços, cada serviço tem sua própria porta (ou container). Isso permite escalar cada serviço de forma independente.

app.listen({ port: 3001, host: '0.0.0.0' });

O host: '0.0.0.0' é necessário para que o serviço seja acessível dentro de um container Docker no futuro.

---

## Como executar

\# Na raiz do projeto, instale as dependências

npm install

 

\# Execute o product-service

npm run product

Teste com curl ou navegador:

curl http://localhost:3001/products

curl http://localhost:3001/products/1

curl http://localhost:3001/products/999  \# retorna 404

---

## Próximo passo

Crie a Branch step/03-order-service

No próximo passo você vai criar o Order Service — um segundo microserviço independente para gerenciar pedidos.

 

# 

# **Branch 03** 

 

Passo 3 — Order Service

Neste passo você vai criar o segundo microserviço: o Order Service. Ele gerencia pedidos de forma completamente independente do Product Service — por enquanto.

---

Objetivo deste passo

Entender que cada microserviço é um processo separado, com sua própria porta, suas próprias dependências e seus próprios dados. O Order Service ainda não sabe nada sobre produtos — e isso é intencional.

---

O que será adicionado

apps/

└── order-service/

    ├── package.json    ← dependências isoladas

    ├── tsconfig.json   ← herda configurações da raiz

    └── src/

        └── server.ts   ← servidor Fastify na porta 3002

 

---

Entendendo o código

1\. Serviço isolado na porta 3002

Enquanto o Product Service usa a porta 3001, o Order Service usa a 3002\. Dois processos Node.js rodando simultaneamente, totalmente independentes.

2\. Interface do pedido

interface Order {

  id: number;

  productId: number;  // só guarda o ID — ainda não busca detalhes

  quantity: number;

  createdAt: string;

}

Perceba que o pedido só armazena o productId. Ele ainda não busca o nome ou preço do produto. Isso será corrigido no próximo passo.

3\. Rota POST tipada

app.post\<{ Body: { productId: number; quantity: number } }\>('/orders', async (req, reply) \=\> {

  // req.body é tipado automaticamente pelo Fastify \+ TypeScript

});

O Fastify permite tipar Body, Params, Querystring e Headers via generics, evitando any.

---

Problema visível neste passo

Crie um pedido e veja o que acontece:

curl \-X POST http://localhost:3002/orders \\

  \-H "Content-Type: application/json" \\

  \-d '{"productId": 1, "quantity": 2}'

Resposta:

{

  "id": 1,

  "productId": 1,

  "quantity": 2,

  "createdAt": "2024-01-01T00:00:00.000Z"

}

O pedido foi criado, mas não sabemos qual produto foi pedido nem qual o valor total. O Order Service está isolado demais — ele precisa conversar com o Product Service.

Essa é exatamente a tensão central dos microserviços: isolamento vs. colaboração.

---

Como executar os dois serviços juntos

Abra dois terminais:

\# Terminal 1

npm run product

 

\# Terminal 2

npm run order

---

Próximo passo

Crie a Branch step/04-http-communication

No próximo passo você vai fazer o Order Service consultar o Product Service via HTTP para enriquecer os pedidos com nome e valor do produto.

 

# 

# **Branch 04**

 

Passo 4 — Comunicação HTTP entre Serviços

Neste passo você vai fazer o Order Service consultar o Product Service via HTTP para obter os detalhes do produto ao criar um pedido.

---

Objetivo deste passo

Implementar a comunicação síncrona entre microserviços usando HTTP/REST nativo (fetch). Entender os trade-offs desse modelo e como usar variáveis de ambiente para tornar as URLs configuráveis.

---

O que mudou

O arquivo apps/order-service/src/server.ts foi atualizado. As principais diferenças em relação ao passo anterior:

| Antes (step 03\) | Agora (step 04\) |
| :---- | :---- |
| Order salva só productId | Order salva productName e total |
| Nenhuma chamada externa | Chama GET /products/:id no Product Service |
| URL hardcoded inexistente | URL lida de variável de ambiente |

---

Entendendo o código

1\. URL configurável por variável de ambiente

const PRODUCT\_SERVICE\_URL \=

  process.env.PRODUCT\_SERVICE\_URL || 'http://localhost:3001';

Em desenvolvimento, usa localhost:3001. Em produção com Docker, a variável de ambiente apontará para o nome do container (http://product-service:3001). Essa é a forma correta de configurar URLs em microserviços.

2\. A chamada HTTP

const response \= await fetch(\`${PRODUCT\_SERVICE\_URL}/products/${productId}\`);

 

if (\!response.ok) {

  return reply.status(404).send({ error: 'Produto não encontrado no Product Service' });

}

 

const product \= await response.json() as Product;

O fetch nativo (disponível no Node.js 18+) é usado para chamar o Product Service. Se o produto não existe, o Order Service retorna 404 — propagando o erro do serviço de origem.

3\. Pedido enriquecido

const order: Order \= {

  id: nextId++,

  productId,

  productName: product.name,   // vem do Product Service

  quantity,

  total: product.price \* quantity,  // calculado com o preço real

  createdAt: new Date().toISOString(),

};

---

Testando a comunicação

Com os dois serviços rodando em terminais separados:

\# Terminal 1

npm run product

 

\# Terminal 2

npm run order

Crie um pedido:

curl \-X POST http://localhost:3002/orders \\

  \-H "Content-Type: application/json" \\

  \-d '{"productId": 1, "quantity": 3}'

Resposta esperada:

{

  "id": 1,

  "productId": 1,

  "productName": "Notebook Pro",

  "quantity": 3,

  "total": 10500,

  "createdAt": "2024-01-01T00:00:00.000Z"

}

Teste com um produto inexistente:

curl \-X POST http://localhost:3002/orders \\

  \-H "Content-Type: application/json" \\

  \-d '{"productId": 999, "quantity": 1}'

---

Trade-offs da comunicação síncrona

Vantagens:

* Simples de implementar e entender  
* Resposta imediata com confirmação

Desvantagens:

* Se o Product Service cair, o Order Service falha junto  
* Aumenta o acoplamento entre serviços  
* Latência acumulada em chamadas encadeadas

Em sistemas mais robustos, comunicação assíncrona (filas como RabbitMQ) resolve esses problemas — mas foge do escopo dessa AV.

---

Próximo passo

Crie a Branch step/05-api-gateway

No próximo passo você vai criar um API Gateway — um ponto de entrada único que roteia as requisições do cliente para o serviço correto.

 

# 

# **Branch 05**

 

Passo 5 — API Gateway

Neste passo você vai criar o API Gateway: o ponto de entrada único para todos os clientes externos. Em vez de o frontend chamar localhost:3001 e localhost:3002 diretamente, ele fala apenas com o gateway na porta 3000\.

---

Objetivo deste passo

Implementar um API Gateway com Fastify que roteia requisições para os serviços internos corretos, sem que o cliente precise conhecer a topologia interna do sistema.

---

O que será adicionado

apps/

└── api-gateway/

    ├── package.json    ← inclui @fastify/http-proxy

    ├── tsconfig.json

    └── src/

        └── server.ts   ← gateway na porta 3000

 

---

Entendendo o código

1\. Plugin @fastify/http-proxy

O plugin faz o proxy reverso: recebe a requisição no gateway e a encaminha para o serviço correto, repassando body, headers e retornando a resposta original.

app.register(httpProxy, {

  upstream: PRODUCT\_SERVICE,   // para onde encaminhar

  prefix: '/products',         // qual prefixo de rota capturar

  rewritePrefix: '/products',  // prefixo mantido na URL encaminhada

});

2\. Rota de health check

app.get('/health', async () \=\> ({

  status: 'ok',

  timestamp: new Date().toISOString(),

}));

É uma boa prática ter um endpoint /health no gateway para monitoramento e orquestradores como o Kubernetes verificarem se o serviço está vivo.

3\. Arquitetura com gateway

Cliente (frontend / curl)

        │

        ▼

   :3000 API Gateway

   ├── /products/\* ──► :3001 Product Service

   ├── /orders/\*   ──► :3002 Order Service

   └── /health     ──► resposta local

 

---

Como executar os três serviços

Abra três terminais:

\# Terminal 1

npm run product

 

\# Terminal 2

npm run order

 

\# Terminal 3

npm run gateway

Agora todas as chamadas passam pelo gateway:

\# Listar produtos (via gateway → product-service)

curl http://localhost:3000/products

 

\# Criar pedido (via gateway → order-service → product-service)

curl \-X POST http://localhost:3000/orders \\

  \-H "Content-Type: application/json" \\

  \-d '{"productId": 2, "quantity": 5}'

 

\# Health check

curl http://localhost:3000/health

---

Por que o API Gateway é importante?

* Ponto único de entrada: o cliente nunca acessa serviços internos diretamente  
* SSL termination: o certificado HTTPS fica só no gateway  
* Autenticação centralizada: middleware de JWT/auth pode ser adicionado aqui  
* Rate limiting e logging: aplicados uma única vez para todos os serviços  
* Flexibilidade interna: serviços podem mudar de porta ou endereço sem impactar o cliente

---

Próximo passo

Crie a Branch step/06-docker

No último passo você vai containerizar todos os serviços com Docker e orquestrá-los com docker-compose, para que tudo suba com um único comando.

# **Branch 06**

 

Passo 6 — Docker e docker-compose

Neste passo você vai containerizar todos os serviços com Docker e orquestrá-los com docker-compose. O objetivo é que todo o sistema suba com um único comando, em um ambiente isolado e reproduzível.

---

Objetivo deste passo

Empacotar cada microserviço em uma imagem Docker e definir como os containers se comunicam entre si usando a rede interna do docker-compose.

---

O que será adicionado

/

├── docker-compose.yml              ← orquestra os 3 serviços

└── apps/

    ├── product-service/Dockerfile

    ├── order-service/Dockerfile

    └── api-gateway/Dockerfile

 

---

Entendendo o Dockerfile (multi-stage build)

Todos os serviços usam o mesmo padrão de multi-stage build:

\# Stage 1: build — compila TypeScript

FROM node:20-alpine AS builder

WORKDIR /app

COPY package\*.json ./

RUN npm install

COPY tsconfig.json ./

COPY src ./src

RUN npm run build

 

\# Stage 2: produção — apenas o JS compilado \+ deps de produção

FROM node:20-alpine

WORKDIR /app

COPY package\*.json ./

RUN npm install \--omit=dev

COPY \--from=builder /app/dist ./dist

EXPOSE 3001

CMD \["node", "dist/server.js"\]

Por que dois stages?

O stage de build instala devDependencies (TypeScript, ts-node) que não são necessárias em produção. O stage final copia apenas o dist/ compilado e instala somente as dependências de produção. A imagem final fica muito menor.

---

Entendendo o docker-compose.yml

Rede interna

O docker-compose cria automaticamente uma rede privada entre os containers. Dentro dessa rede, cada serviço é acessível pelo seu nome (ex: product-service), não por localhost.

Variáveis de ambiente por container

order-service:

  environment:

    \- PRODUCT\_SERVICE\_URL=http://product-service:3001

Note como a URL usa product-service (nome do container) em vez de localhost. É por isso que o código usa process.env.PRODUCT\_SERVICE\_URL — em dev é localhost, em Docker é o nome do serviço.

depends\_on

api-gateway:

  depends\_on:

    \- product-service

    \- order-service

Garante que o gateway só inicia após os outros serviços estarem criados (não garante que estão prontos para receber tráfego, mas é o suficiente para este tutorial).

---

Como executar com Docker

\# Build e inicializa todos os serviços

docker-compose up \--build

 

\# Em outro terminal, teste o sistema completo

curl http://localhost:3000/products

curl http://localhost:3000/health

 

curl \-X POST http://localhost:3000/orders \\

  \-H "Content-Type: application/json" \\

  \-d '{"productId": 1, "quantity": 2}'

 

\# Para encerrar

docker-compose down

---

Comparativo: dev vs Docker

| Aspecto | Desenvolvimento | Docker |
| :---- | :---- | :---- |
| Inicialização | 3 terminais separados | docker-compose up |
| URL entre serviços | localhost:300X | nome do container |
| Compilação | ts-node (direto) | tsc → node dist/ |
| Isolamento | Processo local | Container isolado |

---

Parabéns — AV Prática concluída

Você construiu um sistema de microserviços completo com:

* Dois serviços independentes (Product e Order)  
* Comunicação HTTP entre eles  
* Um API Gateway como ponto de entrada único  
* Containerização com Docker e orquestração com docker-compose

Para o código final completo com todas as partes, faça o merge na branch main.

