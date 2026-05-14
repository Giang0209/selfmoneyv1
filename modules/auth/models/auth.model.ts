// src/modules/auth/models/auth.model.ts

import pool from "@/lib/db";

// Create user
export const createUser = async ({
    phone,
    username,
    name,
    password_hash,
    avatar,
    dob,
    gender,
}: {
    phone: string;

    username?: string;

    name?: string;

    password_hash: string;

    avatar?: string;

    dob?: string;

    gender?: string;
}) => {

    const result = await pool.query(
        `
        INSERT INTO users (
            phone,
            username,
            name,
            password_hash,
            avatar,
            dob,
            gender
        )

        VALUES ($1, $2, $3, $4, $5, $6, $7)

        RETURNING
            id,
            phone,
            username,
            name,
            avatar,
            dob,
            gender,
            created_at
        `,
        [
            phone,
            username || null,
            name || null,
            password_hash,
            avatar || null,
            dob || null,
            gender || null,
        ]
    );

    return result.rows[0];
};

// Find user by phone
export const findUserByPhone =
    async (phone: string) => {

        const result = await pool.query(
            `
            SELECT *

            FROM users

            WHERE phone = $1
            `,
            [phone]
        );

        return result.rows[0];
    };

// Find user by id
export const findUserById =
    async (user_id: number) => {

        const result = await pool.query(
            `
            SELECT
                id,
                phone,
                username,
                name,
                avatar,
                dob,
                gender,
                created_at

            FROM users

            WHERE id = $1
            `,
            [user_id]
        );

        return result.rows[0];
    };