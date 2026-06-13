// src/modules/categories/controllers/category.controller.ts

import {
    requireAuth,
} from "@/modules/auth/middlewares/auth.middleware";

import {
    createCategoryService,
    deleteCategoryService,
    getCategoriesService,
} from "../services/category.service";

// Controller xử lý yêu cầu tạo danh mục mới (Create Category API)
export const createCategoryController =
    async (req: Request) => {

        try {
            // Xác thực đăng nhập người dùng từ JWT Token
            const user =
                await requireAuth(req);

            // Đọc dữ liệu JSON gửi từ phía Client
            const body =
                await req.json();

            // Gọi service thực hiện nghiệp vụ tạo danh mục mới
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

            // Phản hồi thành công dạng JSON với trạng thái 201 Created
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
            // Trả về thông báo lỗi với mã trạng thái 400 Bad Request
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

// Controller xử lý yêu cầu lấy danh sách danh mục (Get Categories API)
export const getCategoriesController =
    async (req: Request) => {

        try {
            // Xác thực thông tin người dùng
            const user =
                await requireAuth(req);

            // Gọi service lấy toàn bộ danh mục của người dùng
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


// Controller xử lý yêu cầu xóa danh mục (Delete Category API)
export const deleteCategoryController =
    async (
        req: Request,
        context: any
    ) => {

        try {
            // Xác thực thông tin người dùng
            const user =
                await requireAuth(req);

            // Lấy ID danh mục từ tham số động đường dẫn (context.params)
            const params =
                await context.params;

            // Gọi service tiến hành thực hiện xóa danh mục
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