import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { GetCodeRequest, PostCodeRequest } from '../../types';
import { logger, prisma } from '../server.js';
import { users_role } from '@prisma/client';

export default async function codeController(fastify: FastifyInstance) {
    fastify.get<{
        Params: GetCodeRequest;
    }>('/code/:slug', async (request: FastifyRequest, reply: FastifyReply) => {
        const params = request.params as GetCodeRequest;

        if (!params.slug) return reply.status(400).send({ error: 'No codeId' });

        const code = await prisma.code.findUnique({
            where: {
                slug: params.slug
            }
        });

        if (!code) return reply.status(404).send({ error: 'Code not found' });

        return reply.send(code);
    });

    fastify.get(
        '/code/all',
        {
            onRequest: fastify.authenticate
        },
        async (request: FastifyRequest, reply: FastifyReply) => {
            let userPerms = await prisma.users.findUnique({
                where: {
                    id: request.user.id
                }
            });

            if (!userPerms) return reply.status(404).send({ error: 'User not found' });

            if (userPerms.role === users_role.ADMIN) {
                await prisma.code
                    .findMany({
                        orderBy: {
                            createdAt: 'desc'
                        }
                    })
                    .then((codes) => {
                        return reply.send(codes);
                    })
                    .catch((err) => {
                        logger.error(err);
                        return reply.status(500).send({ error: 'Internal server error' });
                    });
            }
            return reply.status(401).send({ error: 'Unauthorized' });
        }
    );

    fastify.post<{
        Body: PostCodeRequest;
    }>('/code/post', async (request: FastifyRequest, reply: FastifyReply) => {
        if (!request.body) return reply.status(400).send({ error: 'No body' });

        const body = request.body as PostCodeRequest;

        if (
            !body.slug ||
            !body.code ||
            !body.language ||
            isNaN(body.language) ||
            (body.private !== true && body.private !== false)
        )
            return reply.status(400).send({ error: 'No slug, code, language, private or invalide value' });

        const language = body.language as number;
        const isPrivate = body.private as boolean;

        // Validate language
        const languages = await prisma.languages.findUnique({
            where: {
                id: language
            }
        });

        if (languages === null) return reply.status(400).send({ error: 'Invalid language' });

        const slug = body.slug
            .toLowerCase()
            .replace(/ /g, '-')
            .replace(/[^a-z0-9-_]/g, '')
            .trim();

        if (slug.length > 10) return reply.status(400).send({ error: 'Slug too long' });

        // Verify if slug conflicts with routes
        if (slug === 'api' || slug === 'user' || slug === 'admin' || slug === 'all')
            return reply.status(400).send({ error: 'Slug conflicts with route' });

        // Validate slug
        const validateSlug = await prisma.code.findFirst({
            where: {
                slug: slug
            }
        });

        if (validateSlug) return reply.status(400).send({ error: 'Slug already exists' });

        let userId: number | null = null;
        let title: string | null = null;
        let description: string | null = null;

        // verify if user is connected (JWT)
        if (request.user && request.user.id && !isPrivate) {
            userId = request.user.id;
        }

        if (body.title) {
            if (body.title.length > 50) return reply.status(400).send({ error: 'Title too long' });
            title = String(body.title);
        }

        if (body.description) {
            if (body.description.length > 65500) return reply.status(400).send({ error: 'Description too long' });
            description = body.description;
        }

        // Block XSS attacks
        const protectedCode = body.code.replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\n/g, '<br>');

        // Create code
        await prisma.code
            .create({
                data: {
                    userId: userId,
                    title: title,
                    description: description,
                    slug: slug,
                    code: protectedCode,
                    language: language,
                    private: isPrivate
                }
            })
            .then(async (code) => {
                if (!code) return reply.status(400).send({ error: 'Code not created' });

                return reply.status(201).send({ url: `${process.env.SITE_NAME}/${slug}` });
            })
            .catch(async (error) => {
                logger.error(error);
                return reply.status(400).send({ error: 'Code not created' });
            });
    });
}
