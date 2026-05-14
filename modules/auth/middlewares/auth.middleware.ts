// src/modules/auth/middleware/auth.middleware.ts

import {
    verifyToken,
} from "../utils/auth.util";

import {
    findUserById,
} from "../models/auth.model";

// Require auth
export const requireAuth =
    async (req: Request) => {

        // Authorization header
        const authHeader =
            req.headers.get(
                "authorization"
            );

        if (!authHeader) {
            throw new Error(
                "Unauthorized"
            );
        }

        // Bearer token
        const token =
            authHeader.split(" ")[1];

        if (!token) {
            throw new Error(
                "Token missing"
            );
        }

        // Verify token
        const decoded =
            await verifyToken(token);

        if (!decoded) {
            throw new Error(
                "Invalid token"
            );
        }

        // Check user exists
        const user =
            await findUserById(
                decoded.userId
            );

        if (!user) {
            throw new Error(
                "User not found"
            );
        }

        return decoded;
    };