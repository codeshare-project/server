import { Role } from '.prisma/client';

export interface PostSecurityRequest {
  username?: usersWhereUniqueInput;
  password?: string;
}

export interface GetCodeRequest {
    slug?: codeWhereUniqueInput;
}

export interface PostCodeRequest {
    title?: string;
    description?: string;
    slug?: string;
    code?: string;
    language?: number;
    private?: boolean;
}

export interface GetUserRequest {
    id?: userWhereUniqueInput;
}

export interface PutUserRequest {
    username?: string;
    currentPassword?: string;
    newPassword?: string;
    role?: Role;
}

export type User = {
    id: number,
    username: string,
    password: string,
    role: Role
}

export type Code = {
    id: number,
    userId?: number,
    title?: string,
    description?: string,
    slug: string,
    code: string,
}