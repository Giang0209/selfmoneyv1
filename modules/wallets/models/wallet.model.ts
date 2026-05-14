// src/modules/wallets/models/wallet.model.ts

import pool from "@/lib/db";

// Create wallet
export const createWallet = async ({
    user_id,
    name,
    balance,
    icon,
}: {
    user_id: number;
    name: string;
    balance?: number;
    icon?: string;
}) => {

    try {
        const result = await pool.query(
            `
            INSERT INTO wallets (
                user_id,
                name,
                balance,
                icon
            )
            VALUES ($1, $2, $3, $4)
            RETURNING *
            `,
            [
                user_id,
                name,
                balance || 0,
                icon || null,
            ]
        );

        return result.rows[0];

    } catch (err: any) {

        // PostgreSQL duplicate key error
        if (err.code === "23505") {
            throw new Error("Tên ví đã tồn tại");
        }

        throw err;
    }
};

// Get wallets by user
export const getWalletsByUserId = async (
    user_id: number
) => {

    const result = await pool.query(
        `
        SELECT *
        FROM wallets

        WHERE user_id = $1
        AND deleted_at IS NULL

        ORDER BY created_at DESC
        `,
        [user_id]
    );

    return result.rows;
};

// Find wallet by id
export const findWalletById = async ({
    wallet_id,
    user_id,
}: {
    wallet_id: number;
    user_id: number;
}) => {

    const result = await pool.query(
        `
        SELECT *
        FROM wallets

        WHERE id = $1
        AND user_id = $2
        AND deleted_at IS NULL
        `,
        [
            wallet_id,
            user_id,
        ]
    );

    return result.rows[0];
};

// Update wallet
export const updateWallet = async ({
    wallet_id,
    balance,
}: {
    wallet_id: number;
    balance?: number;
}) => {

    const result = await pool.query(
        `
        UPDATE wallets

        SET
            balance = COALESCE($1, balance)

        WHERE id = $2

        RETURNING *
        `,
        [
            balance,
            wallet_id,
        ]
    );

    return result.rows[0];
};

// Soft delete wallet
export const deleteWallet = async (
    wallet_id: number
) => {

    await pool.query(
        `
        UPDATE wallets

        SET deleted_at = NOW()

        WHERE id = $1
        `,
        [wallet_id]
    );
};