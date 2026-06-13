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

// Controller xử lý yêu cầu tạo ngân sách mới (Create Budget API)
export const createBudgetController =
    async (req: Request) => {

        try {
            // Xác thực thông tin người dùng từ JWT Token gửi lên
            const user =
                await requireAuth(req);

            // Đọc dữ liệu JSON gửi lên từ client
            const body =
                await req.json();

            // Thực hiện nghiệp vụ tạo ngân sách thông qua service
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

            // Phản hồi kết quả thành công với trạng thái 201 Created
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
            // Bắt và phản hồi thông báo lỗi dạng JSON với mã trạng thái 400
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

// Controller xử lý yêu cầu lấy danh sách ngân sách (Get Budgets API)
export const getBudgetsController =
    async (req: Request) => {

        try {
            // Xác thực thông tin người dùng
            const user =
                await requireAuth(req);

            // Gọi service lấy danh sách ngân sách thuộc sở hữu của người dùng
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

// Controller xử lý yêu cầu chỉnh sửa ngân sách (Update Budget API)
export const updateBudgetController =
    async (
        req: Request,
        context: any
    ) => {

        try {
            // Xác thực thông tin người dùng
            const user =
                await requireAuth(req);

            // Lấy ID ngân sách từ đường dẫn động (dynamic route parameter)
            const params =
                await context.params;

            // Đọc dữ liệu hạn mức mới từ JSON body
            const body =
                await req.json();

            // Gọi service cập nhật thông tin ngân sách
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

// Controller xử lý yêu cầu xóa ngân sách (Delete Budget API)
export const deleteBudgetController =
    async (
        req: Request,
        context: any
    ) => {

        try {
            // Xác thực thông tin người dùng
            const user =
                await requireAuth(req);

            // Lấy ID ngân sách từ params động
            const params =
                await context.params;

            // Gọi service thực hiện xóa ngân sách
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