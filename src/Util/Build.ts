import fastify, {
    FastifyInstance,
    FastifyReply,
    FastifyRequest,
    FastifyServerOptions
} from 'fastify';
import fastifyRateLimit, { FastifyRateLimitOptions } from '@fastify/rate-limit';
import fastifyCors, { FastifyCorsOptions } from '@fastify/cors';
import fastifyJwt, { FastifyJWTOptions } from '@fastify/jwt';
import codeController from "../routes/CodeController";
import securityController from "../routes/SecurityController";
import testController from "../routes/TestController";
import userController from "../routes/UserController";



export function build(options: FastifyServerOptions = {}) {
    const app: FastifyInstance = fastify({
        logger: false
    })
        .register(fastifyJwt, {
            secret: process.env.JWT_SECRET || 'secret',
            sign: {
                algorithm: 'HS256',
                iss: process.env.SITE_NAME_SHORT,
                expiresIn: process.env.FASTIFY_JWT_EXPIRES_IN || '7d'
            },
            verify: {
                algorithms: ['HS256'],
                iss: process.env.SITE_NAME_SHORT
            }
        } as FastifyJWTOptions)
        
        // ROUTES
        .register(codeController, { prefix: '/api/v1' })
        .register(securityController, { prefix: '/api/v1' })
        .register(testController, { prefix: '/api/v1' })
        .register(userController, { prefix: '/api/v1' })
        
        
        .decorate('authenticate', async (request: FastifyRequest, reply: FastifyReply) => {
            try {
                await request.jwtVerify();
            } catch (err) {
                return reply.status(401).send({ error: 'Not authenticated' });
            }
        });

    return app;
}
