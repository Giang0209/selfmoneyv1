// src/modules/budgets/services/budget.service.ts

import {
    createBudget,
    findBudgetById,
    findBudgetDuplicate,
    getBudgetsByUserId,
    softDeleteBudget,
    updateBudget,
} from "../models/budget.model";

import {
    CreateBudgetBody,
    UpdateBudgetBody,
} from "../types/budget.type";

import {
    findCategoryById,
} from "@/modules/categories/models/category.model";

// Dịch vụ tạo ngân sách mới (Create Budget Service)
export const createBudgetService =
    async ({
        user_id,
        category_id,
        amount,
        month,
        year,
    }: CreateBudgetBody & {
        user_id: number;
    }) => {

        // Kiểm tra xem đã nhập đầy đủ thông tin bắt buộc chưa
        if (
            !category_id ||
            !amount ||
            !month ||
            !year
        ) {
            throw new Error(
                "Thiếu thông tin budget"
            );
        }

        // Kiểm tra danh mục chi tiêu áp dụng ngân sách có tồn tại không
        const category =
            await findCategoryById(
                category_id
            );

        if (!category) {
            throw new Error(
                "Category không tồn tại"
            );
        }

        // Đảm bảo danh mục này thuộc quyền sở hữu của chính người dùng hiện tại
        if (
            category.user_id !== user_id
        ) {
            throw new Error(
                "Không có quyền"
            );
        }

        // Chỉ danh mục loại 'expense' (chi tiêu) mới được phép lập ngân sách
        if (
            category.type !== "expense"
        ) {
            throw new Error(
                "Chỉ category expense mới tạo budget"
            );
        }

        // Kiểm tra xem danh mục này đã được lập ngân sách cho tháng/năm đó chưa (tránh trùng lặp)
        const existingBudget =
            await findBudgetDuplicate({
                user_id,
                category_id,
                month,
                year,
            });

        if (existingBudget) {
            throw new Error(
                "Budget đã tồn tại"
            );
        }

        // Gọi model để thêm ngân sách vào cơ sở dữ liệu
        return await createBudget({
            user_id,
            category_id,
            amount,
            month,
            year,
        });
    };

// Dịch vụ lấy danh sách toàn bộ ngân sách của người dùng
export const getBudgetsService =
    async (
        user_id: number
    ) => {

        return await getBudgetsByUserId(
            user_id
        );
    };

// Dịch vụ cập nhật hạn mức ngân sách
export const updateBudgetService =
    async ({
        user_id,
        budget_id,
        amount,
    }: UpdateBudgetBody & {
        user_id: number;
    }) => {

        // Tìm kiếm ngân sách cần chỉnh sửa trong DB
        const budget =
            await findBudgetById(
                budget_id
            );

        if (!budget) {
            throw new Error(
                "Budget không tồn tại"
            );
        }

        // Xác thực quyền sở hữu ngân sách
        if (
            budget.user_id !== user_id
        ) {
            throw new Error(
                "Không có quyền"
            );
        }

        // Thực hiện cập nhật số tiền hạn mức mới
        return await updateBudget({
            budget_id,
            amount,
        });
    };

// Dịch vụ xóa ngân sách (xóa mềm)
export const deleteBudgetService =
    async ({
        user_id,
        budget_id,
    }: {
        user_id: number;

        budget_id: number;
    }) => {

        // Kiểm tra ngân sách cần xóa
        const budget =
            await findBudgetById(
                budget_id
            );

        if (!budget) {
            throw new Error(
                "Budget không tồn tại"
            );
        }

        // Xác thực quyền sở hữu trước khi thực hiện xóa
        if (
            budget.user_id !== user_id
        ) {
            throw new Error(
                "Không có quyền"
            );
        }

        // Gọi hàm xóa mềm trong database
        await softDeleteBudget(
            budget_id
        );

        return true;
    };