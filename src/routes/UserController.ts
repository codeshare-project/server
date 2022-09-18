import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { GetUserRequest, PutUserRequest, User } from '../../types';
import { prisma } from '../server.js';
import { createHash } from 'crypto';
import { users_role } from '@prisma/client';
import { create } from 'domain';

export default async function userController(fastify: FastifyInstance) {
    fastify.get<{
        Params: GetUserRequest;
    }>('/user/:id', async (request: FastifyRequest, reply: FastifyReply) => {
        const params = request.params as GetUserRequest;

        if (!params.id) return reply.status(400).send({ error: 'No userId' });

        let userId = Number(params.id);

        if (isNaN(userId)) return reply.status(400).send({ error: 'Invalid userId' });

        const user = await prisma.users.findUnique({
            where: {
                id: userId
            }
        });

        if (!user) return reply.status(404).send({ error: 'User not found' });

        return reply.send({
            id: user.id,
            username: user.username,
            role: user.role
        });
    });

    fastify.get<{
        Params: GetUserRequest;
    }>('/user/:id/codes', async (request: FastifyRequest, reply: FastifyReply) => {
        const params = request.params as GetUserRequest;

        if (!params.id) return reply.status(400).send({ error: 'No userId' });

        let userId = Number(params.id);

        if (isNaN(userId)) return reply.status(400).send({ error: 'Invalid userId' });

        const codes = await prisma.code.findMany({
            where: {
                userId: userId
            }
        });

        if (!codes) return reply.status(404).send({ error: 'No codes found' });

        return reply.send(codes);
    });

    fastify.put<{
        Params: GetUserRequest;
        Body: PutUserRequest;
    }>(
        '/user/:id',
        {
            onRequest: fastify.authenticate
        },
        async (request: FastifyRequest, reply: FastifyReply) => {
            const params = request.params as GetUserRequest;

            if (!request.body) return reply.status(400).send({ error: 'No body' });

            const body = request.body as PutUserRequest;

            if (!params.id) return reply.status(400).send({ error: 'No userId' });

            let userId = Number(params.id);

            if (isNaN(userId)) return reply.status(400).send({ error: 'Invalid userId' });

            if (request.user.id !== userId) return reply.status(403).send({ error: 'You can only modify yourself' });

            if (!body.username && !body.newPassword)
                return reply.status(400).send({ error: 'Please specify at least one thing to change' });

            const user = await prisma.users.findUnique({
                where: {
                    id: userId
                }
            });

            if (!user) return reply.status(404).send({ error: 'User not found' });

            if (body.username) {
                if (body.username.length > 20 || body.username.length < 3)
                    return reply.status(400).send({ error: 'Username too long or too short' });

                let users = await prisma.users.findUnique({
                    where: {
                        username: body.username
                    }
                });

                if (users) return reply.status(400).send({ error: 'Username already taken' });
            }

            let newUser;

            let userDatas: User = user;

            if (request.user.id === userId) {
                if (body.username) userDatas.username = body.username;

                if (body.newPassword) {
                    if (!body.currentPassword) return reply.status(400).send({ error: 'No current password' });

                    if (createHash('sha256').update(body.currentPassword).digest('hex') !== user.password)
                        return reply.status(400).send({ error: 'Wrong current password' });

                    if (body.newPassword.length < 8) return reply.status(400).send({ error: 'New password too short' });

                    userDatas.password = createHash('sha256').update(body.newPassword).digest('hex');
                }
            }

            newUser = await prisma.users.update({
                where: {
                    id: userId
                },
                data: userDatas
            });

            if (!newUser) return reply.status(404).send({ error: 'User not found' });

            return reply.send({
                id: newUser.id,
                username: newUser.username,
                role: newUser.role
            });
        }
    );
}
