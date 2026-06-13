/**
 * src/modules/transactions/models/transaction.model.ts

 */

import pool from "@/lib/db";

/**
 * Tạo mới một giao dịch thu/chi trong cơ sở dữ liệu
 */
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
                note || null, // Nếu ghi chú rỗng thì lưu NULL vào database
                transaction_date,
            ]
        );

        return result.rows[0];
    };

/**
 * Lấy toàn bộ danh sách giao dịch của một người dùng
 */
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

/**
 * Tìm một giao dịch cụ thể theo ID
 */
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

/**
 * Cập nhật thông tin giao dịch (số tiền và/hoặc ghi chú)
 */
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
            amount = COALESCE($1, amount),
            note = COALESCE($2, note),
            updated_at = NOW()
        WHERE id = $3
        RETURNING *
        `,
        [
            amount ?? null,  // Dùng nullish coalescing: chỉ truyền null khi undefined
            note ?? null,
            transaction_id,
        ]
    );

    return result.rows[0];
};

/**
 * Xoá mềm giao dịch (Soft Delete)
 */
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