// src/modules/auth/controllers/auth.controller.ts

import {
    loginService,
    registerService,
} from "../services/auth.service";

// Register
export const registerController =
    async (req: Request) => {

        try {

            const body =
                await req.json();

            const data =
                await registerService({
                    phone:
                        body.phone,

                    password:
                        body.password,

                    username:
                        body.username,

                    name:
                        body.name,

                    avatar:
                        body.avatar,

                    dob:
                        body.dob,

                    gender:
                        body.gender,
                });

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

// Login
export const loginController =
    async (req: Request) => {

        try {

            const body =
                await req.json();

            const data =
                await loginService({
                    phone:
                        body.phone,

                    password:
                        body.password,
                });

            return Response.json({
                message:
                    "Đăng nhập thành công",

                ...data,
            });

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