import Fastify from 'fastify';

const app = Fastify({ logger: true });

interface Order {
    id: number;
    productId: number;
    quantity: number;
    createdAt: string;
}

const orders: Order[] = [];
let nextId = 1;

app.get('/orders', async () => orders);

app.post<{ Body: { productId: number; quantity: number } }>(
    '/orders',
    async (req, reply) => {
        const { productId, quantity } = req.body;

        const order: Order = {
            id: nextId++,
            productId,
            quantity,
            createdAt: new Date().toISOString(),
        };

        orders.push(order);
        return reply.status(201).send(order);
    }
);

app.listen({ port: 3002, host: '0.0.0.0' }, (err) => {
    if (err) {
        app.log.error(err);
        process.exit(1);
    }
});