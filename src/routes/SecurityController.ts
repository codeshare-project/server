import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { prisma, logger } from '../server.js';
import { createHash } from 'crypto';
import { User, PostSecurityRequest } from '../../types';

export default async function securityController(fastify: FastifyInstance) {
    fastify.post<{
        Body: PostSecurityRequest;
    }>('/auth/register', async (request: FastifyRequest, reply: FastifyReply) => {
        if (!request.body) return reply.status(400).send({ error: 'No body' });

        const { username, password } = request.body as PostSecurityRequest;

        if (!username || !password) return reply.status(400).send({ error: 'No username or password' });

        if (username.length > 20 || username.length < 3)
            return reply.status(400).send({ error: 'Username too long or too short' });

        let users = await prisma.users.findUnique({
            where: {
                username
            }
        });

        if (users) return reply.status(400).send({ error: 'Username already exists' });

        if (password.length < 8) return reply.status(400).send({ error: 'Password too short' });

        let passwordHash = createHash('sha256');

        await prisma.users
            .create({
                data: {
                    username,
                    password: passwordHash.update(password).digest('hex')
                }
            })
            .then((user: User) => {
                return reply.status(201).send({ id: user.id, username: user.username, role: user.role });
            })
            .catch((err: String) => {
                return reply.status(500).send({ error: err });
            });
    });

    fastify.post<{
        Body: PostSecurityRequest;
    }>('/auth/login', async (request: FastifyRequest, reply: FastifyReply) => {
        if (!request.body) return reply.status(400).send({ error: 'No body' });

        const { username, password } = request.body as PostSecurityRequest;

        if (!username || !password) return reply.status(400).send({ error: 'No username or password' });

        let hashed = createHash('sha256').update(password).digest('hex');

        await prisma.users
            .findMany({
                where: {
                    username,
                    password: hashed
                }
            })
            .then((users: User[]) => {
                if (users.length === 0) return reply.status(401).send({ error: 'Invalid username or password' });

                let token = fastify.jwt.sign({
                    iss: process.env.SITE_NAME_SHORT,
                    exp: Math.floor(Date.now() / 1000) + 3600,
                    sub: users[0].id,

                    id: users[0].id,
                    name: users[0].username,
                    role: users[0].role
                });

                return reply.status(200).send({ id: users[0].id, token });
            })
            .catch((err: Error) => {
                logger.error(err);
                return reply.status(500).send({ error: 'Error' });
            });
    });
}
