// src/modules/auth/utils/auth.util.ts

import {
    SignJWT,
    jwtVerify,
} from "jose";

import {
    AuthUser,
} from "../types/auth.type";

const JWT_SECRET =
    process.env.JWT_SECRET;

if (!JWT_SECRET) {
    throw new Error(
        "JWT_SECRET is not defined"
    );
}

const secretKey =
    new TextEncoder().encode(
        JWT_SECRET
    );

// Tạo token
export async function signToken(
    payload: AuthUser
): Promise<string> {
    return await new SignJWT({
        ...payload,
    })
        .setProtectedHeader({
            alg: "HS256",
        })
        .setIssuedAt()
        .setExpirationTime("7d")
        .sign(secretKey);
}

// Verify token
export async function verifyToken(
    token: string
): Promise<AuthUser | null> {
    try {
        const { payload } =
            await jwtVerify(
                token,
                secretKey
            );

        return payload as unknown as AuthUser;
    } catch (error) {
        return null;
    }
}