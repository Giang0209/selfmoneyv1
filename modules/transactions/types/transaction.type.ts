// src/modules/transactions/types/transaction.type.ts

export interface CreateTransactionBody {
    wallet_id: number;

    category_id: number;

    amount: number;

    note?: string;

    transaction_date: string;
}

export interface UpdateTransactionBody {
    transaction_id: number;
    amount?: number;
    note?: string;
}