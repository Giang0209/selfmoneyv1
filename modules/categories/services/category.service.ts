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

// Create category
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

        if (!name || !type) {
            throw new Error("Thiếu thông tin category");
        }

        // Check duplicate name
        const existingCategory =
            await findCategoryByName({
                user_id,
                name,
            });

        if (existingCategory) {
            throw new Error("Category đã tồn tại");
        }

        // Check duplicate color in same type
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

        return await createCategory({
            user_id,
            name,
            type,
            icon,
            color,
        });
    };

// Get categories
export const getCategoriesService =
    async (
        user_id: number
    ) => {

        return await getCategoriesByUserId(
            user_id
        );
    };



// Delete category
export const deleteCategoryService =
    async ({
        user_id,
        category_id,
    }: {
        user_id: number;

        category_id: number;
    }) => {

        const category =
            await findCategoryById(
                category_id
            );

        if (!category) {
            throw new Error(
                "Category không tồn tại"
            );
        }

        // Check owner
        if (
            category.user_id !== user_id
        ) {
            throw new Error(
                "Không có quyền"
            );
        }

        await softDeleteCategory(
            category_id
        );

        return true;
    };