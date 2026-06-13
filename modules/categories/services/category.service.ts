// src/modules/categories/services/category.service.ts

import {
    createCategory,
    findCategoryById,
    findCategoryByName,
    getCategoriesByUserId,
    softDeleteCategory,
    findCategoryByColor,
} from "../models/category.model";

import {
    CreateCategoryBody,
    UpdateCategoryBody,
} from "../types/category.type";

// Dịch vụ tạo danh mục mới
export const createCategoryService =
    async ({
        user_id,
        name,
        type,
        icon,
        color,
    }: CreateCategoryBody & {
        user_id: number;
    }) => {

        // Kiểm tra thông tin bắt buộc
        if (!name || !type) {
            throw new Error("Thiếu thông tin category");
        }

        // Kiểm tra xem danh mục có cùng tên đã tồn tại chưa
        const existingCategory =
            await findCategoryByName({
                user_id,
                name,
            });

        if (existingCategory) {
            throw new Error("Category đã tồn tại");
        }

        // Kiểm tra xem màu sắc này đã được sử dụng cho một danh mục khác thuộc cùng loại thu/chi chưa
        if (color) {

            const existingColor =
                await findCategoryByColor({
                    user_id,
                    type,
                    color,
                });

            if (existingColor) {
                throw new Error(
                    "Màu này đã được sử dụng"
                );
            }
        }

        // Tạo danh mục mới trong cơ sở dữ liệu
        return await createCategory({
            user_id,
            name,
            type,
            icon,
            color,
        });
    };

// Dịch vụ lấy danh sách danh mục của người dùng
export const getCategoriesService =
    async (
        user_id: number
    ) => {

        return await getCategoriesByUserId(
            user_id
        );
    };



// Dịch vụ xóa danh mục chi tiêu/thu nhập (xóa mềm)
export const deleteCategoryService =
    async ({
        user_id,
        category_id,
    }: {
        user_id: number;

        category_id: number;
    }) => {

        // Tìm danh mục cần xóa
        const category =
            await findCategoryById(
                category_id
            );

        if (!category) {
            throw new Error(
                "Category không tồn tại"
            );
        }

        // Đảm bảo người dùng thực hiện xóa chính là người sở hữu danh mục này
        if (
            category.user_id !== user_id
        ) {
            throw new Error(
                "Không có quyền"
            );
        }

        // Tiến hành xóa mềm trong database
        await softDeleteCategory(
            category_id
        );

        return true;
    };