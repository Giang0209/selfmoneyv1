// src/modules/auth/controllers/auth.controller.ts

import {
    loginService,
    registerService,
} from "../services/auth.service";

// Controller xử lý yêu cầu đăng ký tài khoản (Register API)
export const registerController =
    async (req: Request) => {

        try {
            // Giải nén body JSON từ yêu cầu gửi lên
            const body =
                await req.json();

            // Thực hiện gọi service xử lý đăng ký
            const data =
                await registerService({
                    phone:
                        body.phone,

                    password:
                        body.password,

                    name:
                        body.name,

                    avatar:
                        body.avatar,

                    dob:
                        body.dob,

                    gender:
                        body.gender,
                });

            // Trả về kết quả thành công dưới dạng JSON với trạng thái 201 Created
            return Response.json(
                {
                    message:
                        "Đăng ký thành công",

                    ...data,
                },
                {
                    status: 201,
                }
            );

        } catch (error: any) {
            // Trả về thông báo lỗi với trạng thái 400 Bad Request nếu có lỗi phát sinh
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

// Controller xử lý yêu cầu đăng nhập tài khoản (Login API)
export const loginController =
    async (req: Request) => {

        try {
            // Giải nén body JSON chứa thông tin đăng nhập
            const body =
                await req.json();

            // Thực hiện gọi service xử lý kiểm tra thông tin đăng nhập
            const data =
                await loginService({
                    phone:
                        body.phone,

                    password:
                        body.password,
                });

            // Trả về dữ liệu kết quả và mã JWT Token nếu thành công
            return Response.json({
                message:
                    "Đăng nhập thành công",

                ...data,
            });

        } catch (error: any) {
            // Trả về thông báo lỗi nếu mật khẩu sai hoặc tài khoản không tồn tại
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