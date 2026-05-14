// src/modules/transactions/models/transaction.model.ts

import pool from "@/lib/db";

// Create transaction
export const createTransaction =
    async ({
        user_id,
        wallet_id,
        category_id,
        amount,
        note,
        transaction_date,
    }: {
        user_id: number;

        wallet_id: number;

        category_id: number;

        amount: number;

        note?: string;

        transaction_date: string;
    }) => {

        const result = await pool.query(
            `
            INSERT INTO transactions (
                user_id,
                wallet_id,
                category_id,
                amount,
                note,
                transaction_date
            )

            VALUES ($1, $2, $3, $4, $5, $6)

            RETURNING *
            `,
            [
                user_id,
                wallet_id,
                category_id,
                amount,
                note || null,
                transaction_date,
            ]
        );

        return result.rows[0];
    };

// Get transactions
export const getTransactionsByUserId =
    async (
        user_id: number
    ) => {

        const result = await pool.query(
            `
            SELECT
                t.*,

                c.name AS category_name,
                c.type AS category_type,
                c.icon AS category_icon,
                c.color AS category_color,

                w.name AS wallet_name

            FROM transactions t

            JOIN categories c
                ON t.category_id = c.id

            JOIN wallets w
                ON t.wallet_id = w.id

            WHERE
                t.user_id = $1

                AND t.deleted_at IS NULL

            ORDER BY
                t.transaction_date DESC
            `,
            [user_id]
        );

        return result.rows;
    };

// Find transaction
export const findTransactionById =
    async (
        transaction_id: number
    ) => {

        const result = await pool.query(
            `
            SELECT *

            FROM transactions

            WHERE id = $1
            `,
            [transaction_id]
        );

        return result.rows[0];
    };

// Update transaction
export const updateTransaction = async ({
    transaction_id,
    amount,
    note,

}: {
    transaction_id: number;
    amount?: number;
    note?: string;
}) => {

    const result = await pool.query(
        `
        UPDATE transactions
        SET
           
            amount = COALESCE($3, amount),
            note = COALESCE($4, note),
            updated_at = NOW()
        WHERE id = $6
        RETURNING *
        `,
        [

            amount ?? null,
            note ?? null,
            transaction_id,
        ]
    );

    return result.rows[0];
};

// Soft delete
export const softDeleteTransaction =
    async (
        transaction_id: number
    ) => {

        await pool.query(
            `
            UPDATE transactions

            SET
                deleted_at = NOW()

            WHERE id = $1
            `,
            [transaction_id]
        );
    };