// src/modules/budgets/controllers/budget.controller.ts

import {
    requireAuth,
} from "@/modules/auth/middlewares/auth.middleware";

import {
    createBudgetService,
    deleteBudgetService,
    getBudgetsService,
    updateBudgetService,
} from "../services/budget.service";

// Create
export const createBudgetController =
    async (req: Request) => {

        try {

            const user =
                await requireAuth(req);

            const body =
                await req.json();

            const budget =
                await createBudgetService({
                    user_id:
                        user.userId,

                    category_id:
                        body.category_id,

                    amount:
                        body.amount,

                    month:
                        body.month,

                    year:
                        body.year,
                });

            return Response.json(
                {
                    message:
                        "Tạo budget thành công",

                    budget,
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
export const getBudgetsController =
    async (req: Request) => {

        try {

            const user =
                await requireAuth(req);

            const budgets =
                await getBudgetsService(
                    user.userId
                );

            return Response.json(
                budgets
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
export const updateBudgetController =
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

            const budget =
                await updateBudgetService({
                    user_id:
                        user.userId,

                    budget_id:
                        Number(params.id),

                    amount:
                        body.amount,
                });

            return Response.json({
                message:
                    "Cập nhật budget thành công",

                budget,
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
export const deleteBudgetController =
    async (
        req: Request,
        context: any
    ) => {

        try {

            const user =
                await requireAuth(req);

            const params =
                await context.params;

            await deleteBudgetService({
                user_id:
                    user.userId,

                budget_id:
                    Number(params.id),
            });

            return Response.json({
                message:
                    "Xóa budget thành công",
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