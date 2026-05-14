// src/app/api/transactions/[id]/route.ts

import {
    deleteTransactionController,
    updateTransactionController,
} from "@/modules/transactions/controllers/transaction.controller";

export async function PATCH(
    req: Request,
    context: {
        params: Promise<{
            id: string;
        }>;
    }
) {
    return updateTransactionController(
        req,
        context
    );
}

export async function DELETE(
    req: Request,
    context: {
        params: Promise<{
            id: string;
        }>;
    }
) {
    return deleteTransactionController(
        req,
        context
    );
}