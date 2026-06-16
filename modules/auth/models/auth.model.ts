// src/modules/auth/models/auth.model.ts

import pool from "@/lib/db";

// Thêm bản ghi người dùng mới vào cơ sở dữ liệu
export const createUser = async ({
    phone,
    name,
    password_hash,
    avatar,
    dob,
    gender,
}: {
    phone: string;

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
            name,
            password_hash,
            avatar,
            dob,
            gender
        )

        VALUES ($1, $2, $3, $4, $5, $6)

        RETURNING
            id,
            phone,
            name,
            avatar,
            dob,
            gender,
            created_at
        `,
        [
            phone,
            name || null,
            password_hash,
            avatar || null,
            dob || null,
            gender || null,
        ]
    );

    return result.rows[0];
};

// Tìm kiếm người dùng dựa trên số điện thoại (dùng để đăng nhập hoặc kiểm tra trùng lặp)
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

// Tìm kiếm người dùng dựa trên ID định danh (dùng để xác thực middleware và xem hồ sơ)
export const findUserById =
    async (user_id: number) => {

        const result = await pool.query(
            `
            SELECT
                id,
                phone,
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