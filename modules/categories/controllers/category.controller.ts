// src/modules/categories/controllers/category.controller.ts

import {
    requireAuth,
} from "@/modules/auth/middlewares/auth.middleware";

import {
    createCategoryService,
    deleteCategoryService,
    getCategoriesService,
} from "../services/category.service";

// Create category
export const createCategoryController =
    async (req: Request) => {

        try {

            const user =
                await requireAuth(req);

            const body =
                await req.json();

            const category =
                await createCategoryService({
                    user_id:
                        user.userId,

                    name:
                        body.name,

                    type:
                        body.type,

                    icon:
                        body.icon,

                    color:
                        body.color,
                });

            return Response.json(
                {
                    message:
                        "Tạo category thành công",

                    category,
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

// Get categories
export const getCategoriesController =
    async (req: Request) => {

        try {

            const user =
                await requireAuth(req);

            const categories =
                await getCategoriesService(
                    user.userId
                );

            return Response.json(
                categories
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


// Delete 
export const deleteCategoryController =
    async (
        req: Request,
        context: any
    ) => {

        try {

            const user =
                await requireAuth(req);

            const params =
                await context.params;

            await deleteCategoryService({
                user_id:
                    user.userId,

                category_id:
                    Number(params.id),
            });

            return Response.json({
                message:
                    "Xóa category thành công",
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