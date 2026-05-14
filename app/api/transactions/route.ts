import {
    createTransactionController,
    getTransactionsController,
} from "@/modules/transactions/controllers/transaction.controller";

export async function POST(
    req: Request
) {
    return createTransactionController(req);
}

export async function GET(
    req: Request
) {
    return getTransactionsController(req);
}