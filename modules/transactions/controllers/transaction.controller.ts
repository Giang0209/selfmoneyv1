// src/modules/transactions/controllers/transaction.controller.ts

import {
    requireAuth,
} from "@/modules/auth/middlewares/auth.middleware";

import {
    createTransactionService,
    deleteTransactionService,
    getTransactionsService,
    updateTransactionService,
} from "../services/transaction.service";

// Create
export const createTransactionController =
    async (req: Request) => {

        try {

            const user =
                await requireAuth(req);

            const body =
                await req.json();

            const transaction =
                await createTransactionService({
                    user_id:
                        user.userId,

                    wallet_id:
                        body.wallet_id,

                    category_id:
                        body.category_id,

                    amount:
                        body.amount,

                    note:
                        body.note,

                    transaction_date:
                        body.transaction_date,
                });

            return Response.json(
                {
                    message:
                        "Tạo transaction thành công",

                    transaction,
                },
                {
                    status: 201,
                }
            );

        } catch (error: any) {

            return Response.json(
                {
                    message:
                        error.message,
                },
                {
                    status: 400,
                }
            );
        }
    };

// Get
export const getTransactionsController =
    async (req: Request) => {

        try {

            const user =
                await requireAuth(req);

            const transactions =
                await getTransactionsService(
                    user.userId
                );

            return Response.json(
                transactions
            );

        } catch (error: any) {

            return Response.json(
                {
                    message:
                        error.message,
                },
                {
                    status: 400,
                }
            );
        }
    };

// Update
export const updateTransactionController =
    async (
        req: Request,
        context: any
    ) => {

        try {

            const user =
                await requireAuth(req);

            const params =
                await context.params;

            const body =
                await req.json();

            const transaction =
                await updateTransactionService({
                    user_id:
                        user.userId,

                    transaction_id:
                        Number(params.id),

                    amount:
                        body.amount,

                    note:
                        body.note,

                });

            return Response.json({
                message:
                    "Cập nhật transaction thành công",

                transaction,
            });

        } catch (error: any) {

            return Response.json(
                {
                    message:
                        error.message,
                },
                {
                    status: 400,
                }
            );
        }
    };

// Delete
export const deleteTransactionController =
    async (
        req: Request,
        context: any
    ) => {

        try {

            const user =
                await requireAuth(req);

            const params =
                await context.params;

            await deleteTransactionService({
                user_id:
                    user.userId,

                transaction_id:
                    Number(params.id),
            });

            return Response.json({
                message:
                    "Xóa transaction thành công",
            });

        } catch (error: any) {

            return Response.json(
                {
                    message:
                        error.message,
                },
                {
                    status: 400,
                }
            );
        }
    };