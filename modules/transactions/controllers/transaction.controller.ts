/**
 * src/modules/transactions/controllers/transaction.controller.ts
 */

import {
    requireAuth,
} from "@/modules/auth/middlewares/auth.middleware";

import {
    createTransactionService,
    deleteTransactionService,
    getTransactionsService,
    updateTransactionService,
} from "../services/transaction.service";

/**
 * Controller tạo mới giao dịch
 */
export const createTransactionController =
    async (req: Request) => {

        try {

            // Xác thực người dùng - lấy thông tin user từ JWT token
            const user =
                await requireAuth(req);

            // Đọc dữ liệu giao dịch từ request body
            const body =
                await req.json();

            // Gọi service xử lý logic tạo giao dịch
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

            // Trả về kết quả thành công với HTTP 201
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

            // Trả về thông báo lỗi với HTTP 400 (Bad Request)
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

/**
 * Controller lấy danh sách giao dịch
 */
export const getTransactionsController =
    async (req: Request) => {

        try {

            // Xác thực và lấy thông tin người dùng
            const user =
                await requireAuth(req);

            // Truy vấn toàn bộ giao dịch của user
            const transactions =
                await getTransactionsService(
                    user.userId
                );

            // Trả về danh sách giao dịch (HTTP 200 mặc định)
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

/**
 * Controller cập nhật giao dịch
 */
export const updateTransactionController =
    async (
        req: Request,
        context: any
    ) => {

        try {

            // Xác thực người dùng
            const user =
                await requireAuth(req);

            // Lấy ID giao dịch từ URL params (VD: /api/transactions/5 → id = 5)
            const params =
                await context.params;

            // Đọc dữ liệu cập nhật từ request body
            const body =
                await req.json();

            // Gọi service cập nhật giao dịch (bao gồm đồng bộ số dư ví)
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

            // Trả về giao dịch đã cập nhật
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

/**
 * Controller xoá mềm giao dịch
 */
export const deleteTransactionController =
    async (
        req: Request,
        context: any
    ) => {

        try {

            // Xác thực người dùng
            const user =
                await requireAuth(req);

            // Lấy ID giao dịch từ URL params
            const params =
                await context.params;

            // Gọi service xoá mềm (hoàn trả số dư ví + đánh dấu deleted_at)
            await deleteTransactionService({
                user_id:
                    user.userId,

                transaction_id:
                    Number(params.id),
            });

            // Trả về thông báo xoá thành công
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