import { FastifyInstance, FastifyReply, FastifyRequest, FastifyServerOptions } from 'fastify';

export default async function (fastify: FastifyInstance) {
    fastify.get('/test', async (request: FastifyRequest, reply: FastifyReply) => {
        return reply.status(200).send({ message: 'Hello World' });
    });
}
