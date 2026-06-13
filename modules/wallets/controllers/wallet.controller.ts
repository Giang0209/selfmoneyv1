// src/modules/wallets/controllers/wallet.controller.ts
// Tầng Controller - xử lý HTTP request cho ví

import {
    requireAuth,
} from "@/modules/auth/middlewares/auth.middleware";

import {
    createWalletService,
    deleteWalletService,
    getWalletsService,
    updateWalletService,
} from "../services/wallet.service";

// Tạo ví mới - POST /api/wallets
export const createWalletController =
    async (req: Request) => {

        try {

            const user =
                await requireAuth(req);

            const body =
                await req.json();

            const wallet =
                await createWalletService({
                    user_id:
                        user.userId,
                    name:
                        body.name,
                    balance:
                        body.balance,
                    icon:
                        body.icon,
                });

            return Response.json(
                {
                    message:
                        "Tạo ví thành công",
                    wallet,
                },
                {
                    status: 201,
                }
            );

        } catch (error: any) {

            const message = error.message || "Lỗi server";

            // Lỗi trùng tên ví
            if (message.includes("đã tồn tại")) {
                return Response.json(
                    { message },
                    { status: 409 } // Conflict
                );
            }

            // Lỗi thiếu dữ liệu bắt buộc
            if (message.includes("bắt buộc")) {
                return Response.json(
                    { message },
                    { status: 400 }
                );
            }

            // Lỗi không xác định
            return Response.json(
                { message: "Lỗi server" },
                { status: 500 }
            );
        }
    };

// Lấy danh sách ví - GET /api/wallets
export const getWalletsController =
    async (req: Request) => {

        try {

            const user =
                await requireAuth(req);

            const wallets =
                await getWalletsService(
                    user.userId
                );

            return Response.json(
                wallets
            );

        } catch (error: any) {

            return Response.json(
                {
                    message:
                        error.message
                },
                {
                    status: 400,
                }
            );
        }
    };

// Cập nhật số dư ví - PUT /api/wallets/:id
export const updateWalletController =
    async (
        req: Request,
        {
            params,
        }: {
            params: Promise<{
                id: string;
            }>;
        }
    ) => {

        try {

            const user =
                await requireAuth(req);

            const { id } =
                await params;

            const body =
                await req.json();

            const wallet =
                await updateWalletService({
                    user_id:
                        user.userId,

                    wallet_id:
                        Number(id),

                    balance:
                        body.balance,
                });

            return Response.json(
                {
                    message:
                        "Cập nhật số dư thành công",

                    wallet,
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

// Xoá mềm ví - DELETE /api/wallets/:id
export const deleteWalletController =
    async (
        req: Request,
        {
            params,
        }: {
            params: Promise<{
                id: string;
            }>;
        }
    ) => {

        try {

            const user =
                await requireAuth(req);

            const { id } =
                await params;

            await deleteWalletService({
                user_id:
                    user.userId,

                wallet_id:
                    Number(id),
            });

            return Response.json({
                message:
                    "Xóa ví thành công",
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