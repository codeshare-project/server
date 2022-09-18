import fastify, {FastifyRequest, FastifyReply} from "fastify";
import "@fastify/jwt";
import {User} from "../index";

declare module 'fastify' {
    export interface FastifyInstance {
        authenticate: (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
    }
}

declare module "@fastify/jwt" {
    interface FastifyJWT {
        user: User
    }
}