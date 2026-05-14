// src/modules/profiles/controllers/profile.controller.ts

import {
    requireAuth,
} from "@/modules/auth/middlewares/auth.middleware";

import {
    changePasswordService,
    getProfileService,
    updateProfileService,
} from "../services/profile.service";

// Get profile
export const getProfileController =
    async (req: Request) => {

        try {

            const user =
                await requireAuth(req);

            const profile =
                await getProfileService(
                    user.userId
                );

            return Response.json(
                profile
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

// Update profile
export const updateProfileController =
    async (req: Request) => {

        try {

            const user =
                await requireAuth(req);

            const body =
                await req.json();

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

// Change password
export const changePasswordController =
    async (req: Request) => {

        try {

            const user =
                await requireAuth(req);

            const body =
                await req.json();

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