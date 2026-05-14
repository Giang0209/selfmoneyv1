// src/modules/profiles/models/profile.model.ts

import pool from "@/lib/db";

// Get profile
export const getProfileById =
    async (user_id: number) => {

        const result = await pool.query(
            `
            SELECT
                id,
                phone,
                username,
                name,
                avatar,
                dob::text,
                gender,
                created_at

            FROM users

            WHERE id = $1
            `,
            [user_id]
        );

        return result.rows[0];
    };

// Get password hash
export const getPasswordByUserId =
    async (
        user_id: number
    ) => {

        const result = await pool.query(
            `
            SELECT password_hash

            FROM users

            WHERE id = $1
            `,
            [user_id]
        );

        return result.rows[0];
    };

// Update profile
export const updateProfile = async ({
    user_id,
    name,
    username,
    avatar,
    dob,
    gender,
}: {
    user_id: number;

    name?: string;

    username?: string;

    avatar?: string;

    dob?: string;

    gender?: string;
}) => {

    const result = await pool.query(
        `
        UPDATE users

        SET
            name = COALESCE($1, name),

            username = COALESCE($2, username),

            avatar = COALESCE($3, avatar),

            dob = COALESCE($4, dob),

            gender = COALESCE($5, gender)

        WHERE id = $6

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
            name || null,
            username || null,
            avatar || null,
            dob || null,
            gender || null,
            user_id,
        ]
    );

    return result.rows[0];
};

// Update password
export const updatePassword =
    async ({
        user_id,
        password_hash,
    }: {
        user_id: number;

        password_hash: string;
    }) => {

        await pool.query(
            `
            UPDATE users

            SET password_hash = $1

            WHERE id = $2
            `,
            [
                password_hash,
                user_id,
            ]
        );
    };