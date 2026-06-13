// src/modules/profiles/controllers/profile.controller.ts

import {
    requireAuth,
} from "@/modules/auth/middlewares/auth.middleware";

import {
    changePasswordService,
    getProfileService,
    updateProfileService,
} from "../services/profile.service";

// Controller xử lý yêu cầu xem thông tin hồ sơ cá nhân (Get Profile API)
export const getProfileController =
    async (req: Request) => {

        try {
            // Xác thực xem người dùng đã đăng nhập chưa
            const user =
                await requireAuth(req);

            // Gọi service lấy thông tin hồ sơ chi tiết
            const profile =
                await getProfileService(
                    user.userId
                );

            return Response.json(
                profile
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

// Controller xử lý yêu cầu cập nhật hồ sơ cá nhân (Update Profile API)
export const updateProfileController =
    async (req: Request) => {

        try {
            // Xác thực đăng nhập người dùng từ JWT
            const user =
                await requireAuth(req);

            // Đọc dữ liệu JSON gửi lên từ Client
            const body =
                await req.json();

            // Thực hiện nghiệp vụ cập nhật hồ sơ thông qua service
            const profile =
                await updateProfileService({
                    user_id:
                        user.userId,

                    name:
                        body.name,

                    username:
                        body.username,

                    avatar:
                        body.avatar,

                    dob:
                        body.dob,

                    gender:
                        body.gender,
                });

            return Response.json({
                message:
                    "Cập nhật profile thành công",

                profile,
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

// Controller xử lý yêu cầu đổi mật khẩu tài khoản (Change Password API)
export const changePasswordController =
    async (req: Request) => {

        try {
            // Xác thực thông tin người dùng
            const user =
                await requireAuth(req);

            // Đọc dữ liệu mật khẩu cũ và mới từ body
            const body =
                await req.json();

            // Gọi service thực hiện đổi mật khẩu
            await changePasswordService({
                user_id:
                    user.userId,

                old_password:
                    body.old_password,

                new_password:
                    body.new_password,
            });

            return Response.json({
                message:
                    "Đổi mật khẩu thành công",
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