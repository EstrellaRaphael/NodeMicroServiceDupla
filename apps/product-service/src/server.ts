import Fastify from 'fastify';

const app = Fastify({ logger: true });

interface Product {
  id: number;
  name: string;
  price: number;
  stock: number;
}

const products: Product[] = [
  { id: 1, name: 'Notebook Pro',     price: 3500, stock: 10 },
  { id: 2, name: 'Mouse Gamer',      price: 250,  stock: 50 },
  { id: 3, name: 'Teclado Mecânico', price: 400,  stock: 30 },
];

app.get('/products', async () => products);

app.get<{ Params: { id: string } }>('/products/:id', async (req, reply) => {
  const product = products.find(p => p.id === Number(req.params.id));
  if (!product) {
    return reply.status(404).send({ error: 'Produto não encontrado' });
  }
  return product;
});

app.listen({ port: 3001, host: '0.0.0.0' }, (err) => {
  if (err) {
    app.log.error(err);
    process.exit(1);
  }
});
