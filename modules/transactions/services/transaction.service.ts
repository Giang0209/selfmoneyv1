/**
 * src/modules/transactions/services/transaction.service.ts
 *
 * Tầng Service (Business Logic Layer) cho module Giao dịch
 * Xử lý toàn bộ logic nghiệp vụ liên quan đến giao dịch thu/chi:
 * - Xác thực dữ liệu đầu vào
 * - Kiểm tra quyền sở hữu ví và danh mục
 * - Đồng bộ số dư ví khi tạo/sửa/xoá giao dịch
 * - Gọi xuống tầng Model để thao tác database
 */

import {
    findCategoryById,
} from "@/modules/categories/models/category.model";

import {
    findWalletById,
} from "@/modules/wallets/models/wallet.model";

import pool from "@/lib/db";

import {
    createTransaction,
    findTransactionById,
    getTransactionsByUserId,
    softDeleteTransaction,
    updateTransaction,
} from "../models/transaction.model";

import {
    CreateTransactionBody,
    UpdateTransactionBody,
} from "../types/transaction.type";

/**
 * Tạo mới một giao dịch thu/chi
 */
export const createTransactionService =
    async ({
        user_id,
        wallet_id,
        category_id,
        amount,
        note,
        transaction_date,
    }: CreateTransactionBody & {
        user_id: number;
    }) => {

        // Bước 1: Kiểm tra các trường bắt buộc
        if (
            !wallet_id ||
            !category_id ||
            !amount ||
            !transaction_date
        ) {
            throw new Error(
                "Thiếu dữ liệu transaction"
            );
        }

        // Bước 2: Kiểm tra ví có tồn tại và thuộc quyền người dùng không
        const wallet =
            await findWalletById(
                {
                    wallet_id,
                    user_id
                }
            );

        if (!wallet) {
            throw new Error(
                "Wallet không tồn tại"
            );
        }

        // Bước 3: Kiểm tra danh mục có tồn tại không
        const category =
            await findCategoryById(
                category_id
            );

        if (!category) {
            throw new Error(
                "Category không tồn tại"
            );
        }

        // Bước 3b: Xác minh quyền sở hữu - ví và danh mục phải cùng thuộc người dùng
        if (
            wallet.user_id !== user_id ||
            category.user_id !== user_id
        ) {
            throw new Error(
                "Không có quyền"
            );
        }

        // Bước 4: Tạo bản ghi giao dịch trong database
        const transaction =
            await createTransaction({
                user_id,
                wallet_id,
                category_id,
                amount,
                note,
                transaction_date,
            });

        // Bước 5: Cập nhật số dư ví tương ứng
        // Nếu danh mục là "income" (thu nhập) → cộng tiền vào ví
        // Nếu danh mục là "expense" (chi tiêu) → trừ tiền khỏi ví
        if (
            category.type === "income"
        ) {

            await pool.query(
                `
                UPDATE wallets

                SET balance = balance + $1

                WHERE id = $2
                `,
                [
                    amount,
                    wallet_id,
                ]
            );

        } else {

            await pool.query(
                `
                UPDATE wallets

                SET balance = balance - $1

                WHERE id = $2
                `,
                [
                    amount,
                    wallet_id,
                ]
            );
        }

        return transaction;
    };

/**
 * Lấy toàn bộ danh sách giao dịch của người dùng
 */
export const getTransactionsService =
    async (
        user_id: number
    ) => {

        return await getTransactionsByUserId(
            user_id
        );
    };

/**
 * Cập nhật thông tin giao dịch (số tiền và/hoặc ghi chú)
 */
export const updateTransactionService =
    async ({
        user_id,
        transaction_id,
        amount,
        note,
    }: UpdateTransactionBody & {
        user_id: number;
    }) => {

        // Bước 1: Tìm giao dịch hiện tại trong database
        const transaction =
            await findTransactionById(
                transaction_id
            );

        if (!transaction) {
            throw new Error(
                "Transaction không tồn tại"
            );
        }

        // Bước 2: Kiểm tra quyền sở hữu giao dịch
        if (
            transaction.user_id !== user_id
        ) {
            throw new Error(
                "Không có quyền"
            );
        }

        // Bước 3: Nếu số tiền thay đổi → đồng bộ lại số dư ví
        if (amount !== undefined && amount !== null) {
            // Tính chênh lệch giữa số tiền mới và số tiền cũ
            const diff = Number(amount) - Number(transaction.amount);
            if (diff !== 0) {
                // Lấy thông tin danh mục để biết đây là thu nhập hay chi tiêu
                const category = await findCategoryById(transaction.category_id);
                if (!category) {
                    throw new Error("Category không tồn tại");
                }

                // Thu nhập: cộng chênh lệch vào ví (VD: 500→800 thì cộng thêm 300)
                if (category.type === "income") {
                    await pool.query(
                        `
                        UPDATE wallets
                        SET balance = balance + $1
                        WHERE id = $2
                        `,
                        [diff, transaction.wallet_id]
                    );
                } else {
                    // Chi tiêu: trừ chênh lệch khỏi ví (VD: 500→800 thì trừ thêm 300)
                    await pool.query(
                        `
                        UPDATE wallets
                        SET balance = balance - $1
                        WHERE id = $2
                        `,
                        [diff, transaction.wallet_id]
                    );
                }
            }
        }

        // Bước 4: Cập nhật bản ghi giao dịch (dùng COALESCE để giữ nguyên trường không đổi)
        return await updateTransaction({
            transaction_id,
            amount,
            note,
        });
    };

/**
 * Xoá mềm một giao dịch
 */
export const deleteTransactionService =
    async ({
        user_id,
        transaction_id,
    }: {
        user_id: number;

        transaction_id: number;
    }) => {

        // Bước 1: Tìm giao dịch cần xoá
        const transaction =
            await findTransactionById(
                transaction_id
            );

        if (!transaction) {
            throw new Error(
                "Transaction không tồn tại"
            );
        }

        // Bước 2: Kiểm tra quyền sở hữu
        if (
            transaction.user_id !== user_id
        ) {
            throw new Error(
                "Không có quyền"
            );
        }

        // Lấy thông tin danh mục để xác định loại giao dịch
        const category = await findCategoryById(transaction.category_id);
        if (!category) {
            throw new Error("Category không tồn tại");
        }

        // Bước 3: Hoàn trả số dư ví trước khi xoá mềm
        const amount = Number(transaction.amount);
        if (category.type === "income") {
            // Giao dịch thu nhập bị xoá → trừ lại số tiền đã cộng vào ví
            await pool.query(
                `
                UPDATE wallets
                SET balance = balance - $1
                WHERE id = $2
                `,
                [amount, transaction.wallet_id]
            );
        } else {
            // Giao dịch chi tiêu bị xoá → cộng lại số tiền đã trừ khỏi ví
            await pool.query(
                `
                UPDATE wallets
                SET balance = balance + $1
                WHERE id = $2
                `,
                [amount, transaction.wallet_id]
            );
        }

        // Bước 4: Đánh dấu xoá mềm giao dịch
        await softDeleteTransaction(
            transaction_id
        );

        return true;
    };