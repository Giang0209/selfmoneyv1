// src/modules/transactions/services/transaction.service.ts

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

// Create transaction
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

        // Check wallet
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

        // Check category
        const category =
            await findCategoryById(
                category_id
            );

        if (!category) {
            throw new Error(
                "Category không tồn tại"
            );
        }

        // Check owner
        if (
            wallet.user_id !== user_id ||
            category.user_id !== user_id
        ) {
            throw new Error(
                "Không có quyền"
            );
        }

        // Create transaction
        const transaction =
            await createTransaction({
                user_id,
                wallet_id,
                category_id,
                amount,
                note,
                transaction_date,
            });

        // Update wallet balance
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

// Get transactions
export const getTransactionsService =
    async (
        user_id: number
    ) => {

        return await getTransactionsByUserId(
            user_id
        );
    };

// Update transaction
export const updateTransactionService =
    async ({
        user_id,
        transaction_id,
        amount,
        note,
    }: UpdateTransactionBody & {
        user_id: number;
    }) => {

        const transaction =
            await findTransactionById(
                transaction_id
            );

        if (!transaction) {
            throw new Error(
                "Transaction không tồn tại"
            );
        }

        if (
            transaction.user_id !== user_id
        ) {
            throw new Error(
                "Không có quyền"
            );
        }

        return await updateTransaction({
            transaction_id,
            amount,
            note,
        });
    };

// Delete transaction
export const deleteTransactionService =
    async ({
        user_id,
        transaction_id,
    }: {
        user_id: number;

        transaction_id: number;
    }) => {

        const transaction =
            await findTransactionById(
                transaction_id
            );

        if (!transaction) {
            throw new Error(
                "Transaction không tồn tại"
            );
        }

        if (
            transaction.user_id !== user_id
        ) {
            throw new Error(
                "Không có quyền"
            );
        }

        await softDeleteTransaction(
            transaction_id
        );

        return true;
    };