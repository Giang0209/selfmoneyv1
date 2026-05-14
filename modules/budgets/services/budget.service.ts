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

// Create
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

        const category =
            await findCategoryById(
                category_id
            );

        if (!category) {
            throw new Error(
                "Category không tồn tại"
            );
        }

        if (
            category.user_id !== user_id
        ) {
            throw new Error(
                "Không có quyền"
            );
        }

        if (
            category.type !== "expense"
        ) {
            throw new Error(
                "Chỉ category expense mới tạo budget"
            );
        }

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

        return await createBudget({
            user_id,
            category_id,
            amount,
            month,
            year,
        });
    };

// Get
export const getBudgetsService =
    async (
        user_id: number
    ) => {

        return await getBudgetsByUserId(
            user_id
        );
    };

// Update
export const updateBudgetService =
    async ({
        user_id,
        budget_id,
        amount,
    }: UpdateBudgetBody & {
        user_id: number;
    }) => {

        const budget =
            await findBudgetById(
                budget_id
            );

        if (!budget) {
            throw new Error(
                "Budget không tồn tại"
            );
        }

        if (
            budget.user_id !== user_id
        ) {
            throw new Error(
                "Không có quyền"
            );
        }

        return await updateBudget({
            budget_id,
            amount,
        });
    };

// Delete
export const deleteBudgetService =
    async ({
        user_id,
        budget_id,
    }: {
        user_id: number;

        budget_id: number;
    }) => {

        const budget =
            await findBudgetById(
                budget_id
            );

        if (!budget) {
            throw new Error(
                "Budget không tồn tại"
            );
        }

        if (
            budget.user_id !== user_id
        ) {
            throw new Error(
                "Không có quyền"
            );
        }

        await softDeleteBudget(
            budget_id
        );

        return true;
    };