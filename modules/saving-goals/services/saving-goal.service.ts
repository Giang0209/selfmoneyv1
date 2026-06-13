// src/modules/saving-goals/services/saving-goal.service.ts

import {
    createSavingGoal,
    getSavingGoalsByUserId,
    findSavingGoalById,
    updateSavingGoal,
    updateSavingGoalSavedAmount,
    softDeleteSavingGoal,
    addSavingContribution,
    getSavingContributionsByGoalId,
} from "../models/saving-goal.model";

import {
    CreateSavingGoalBody,
    UpdateSavingGoalBody,
} from "../types/saving-goal.type";

import { findCategoryByName, createCategory } from "@/modules/categories/models/category.model";
import { createTransactionService } from "@/modules/transactions/services/transaction.service";
import pool from "@/lib/db";

// Tạo mục tiêu tiết kiệm mới
export const createGoalService = async (
    user_id: number,
    body: CreateSavingGoalBody
) => {
    if (!body.name || !body.target_amount) {
        throw new Error("Tên mục tiêu và số tiền mục tiêu là bắt buộc");
    }

    return await createSavingGoal({
        user_id,
        category_id: body.category_id,
        name: body.name,
        icon: body.icon,
        target_amount: Number(body.target_amount),
        deadline: body.deadline,
        color: body.color,
    });
};

// Lấy danh sách mục tiêu tiết kiệm của người dùng
export const getGoalsService = async (user_id: number) => {
    return await getSavingGoalsByUserId(user_id);
};

// Lấy chi tiết mục tiêu tiết kiệm
export const getGoalByIdService = async (user_id: number, goal_id: number) => {
    const goal = await findSavingGoalById(goal_id);
    if (!goal || goal.user_id !== user_id) {
        throw new Error("Không tìm thấy mục tiêu tiết kiệm");
    }
    return goal;
};

// Cập nhật mục tiêu tiết kiệm
export const updateGoalService = async (
    user_id: number,
    goal_id: number,
    body: UpdateSavingGoalBody
) => {
    const goal = await findSavingGoalById(goal_id);
    if (!goal || goal.user_id !== user_id) {
        throw new Error("Không tìm thấy mục tiêu tiết kiệm");
    }

    return await updateSavingGoal({
        goal_id,
        name: body.name,
        icon: body.icon,
        target_amount: body.target_amount !== undefined ? Number(body.target_amount) : undefined,
        deadline: body.deadline,
        color: body.color,
        status: body.status,
        category_id: body.category_id,
    });
};

// Xoá mềm mục tiêu
export const deleteGoalService = async (user_id: number, goal_id: number) => {
    const goal = await findSavingGoalById(goal_id);
    if (!goal || goal.user_id !== user_id) {
        throw new Error("Không tìm thấy mục tiêu tiết kiệm");
    }
    await softDeleteSavingGoal(goal_id);
    return true;
};

// Lấy lịch sử đóng góp của mục tiêu tiết kiệm
export const getGoalContributionsService = async (user_id: number, goal_id: number) => {
    const goal = await findSavingGoalById(goal_id);
    if (!goal || goal.user_id !== user_id) {
        throw new Error("Không tìm thấy mục tiêu tiết kiệm");
    }
    return await getSavingContributionsByGoalId(goal_id);
};

// Nạp tiền vào mục tiêu tiết kiệm
export const contributeToGoalService = async ({
    user_id,
    goal_id,
    wallet_id,
    amount,
    note,
}: {
    user_id: number;
    goal_id: number;
    wallet_id: number;
    amount: number;
    note?: string;
}) => {
    // 1. Kiểm tra Goal tồn tại và thuộc sở hữu của user
    const goal = await findSavingGoalById(goal_id);
    if (!goal || goal.user_id !== user_id) {
        throw new Error("Mục tiêu tiết kiệm không tồn tại");
    }

    if (!amount || amount <= 0) {
        throw new Error("Số tiền nạp phải lớn hơn 0");
    }

    // 2. Tìm hoặc tạo tự động danh mục "Tiết kiệm" (type = 'expense') của user
    let savingCategory = await findCategoryByName({
        user_id,
        name: "Tiết kiệm",
    });

    if (!savingCategory || savingCategory.type !== "expense") {
        savingCategory = await createCategory({
            user_id,
            name: "Tiết kiệm",
            type: "expense",
            icon: "🎯",
            color: "violet",
        });
    }

    // 3. Tạo một Giao dịch (Transaction) chi tiêu để trừ tiền trong ví nguồn
    const transaction = await createTransactionService({
        user_id,
        wallet_id,
        category_id: savingCategory.id,
        amount,
        note: note || `Tiết kiệm cho mục tiêu: ${goal.name}`,
        transaction_date: new Date().toISOString(),
    });

    // 4. Lưu lịch sử đóng góp vào bảng saving_contributions
    const contribution = await addSavingContribution({
        goal_id,
        user_id,
        transaction_id: transaction.id,
        amount,
        note: note || `Nạp từ ví`,
    });

    // 5. Cộng số tiền nạp vào saved_amount của Goal
    const updatedGoal = await updateSavingGoalSavedAmount(goal_id, amount);

    return {
        contribution,
        goal: updatedGoal,
        transaction,
    };
};

// Lấy danh sách ngân sách danh mục còn dư cuối tháng
export const getBudgetSurplusService = async (
    user_id: number,
    month: number,
    year: number
) => {
    // Chỉ cho phép chuyển dư nếu tháng đó đã kết thúc (tháng trong quá khứ)
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1; // 1-indexed

    if (year > currentYear || (year === currentYear && month >= currentMonth)) {
        return [];
    }

    // 1. Lấy tất cả ngân sách của user trong tháng/năm chỉ định
    const budgetsResult = await pool.query(
        `
        SELECT 
            b.*,
            c.name AS category_name,
            c.icon AS category_icon,
            c.color AS category_color
        FROM budgets b
        INNER JOIN categories c ON c.id = b.category_id
        WHERE b.user_id = $1 
          AND b.month = $2 
          AND b.year = $3 
          AND b.deleted_at IS NULL
        `,
        [user_id, month, year]
    );
    const budgets = budgetsResult.rows;

    const surplusList = [];

    // Tính khoảng thời gian của tháng đó
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 1); // exclusive

    for (const budget of budgets) {
        // 2. Tính tổng chi tiêu thực tế của danh mục này trong tháng đó
        // Loại trừ giao dịch thuộc category "Tiết kiệm"
        const spentResult = await pool.query(
            `
            SELECT COALESCE(SUM(t.amount), 0) AS total_spent
            FROM transactions t
            INNER JOIN categories c ON c.id = t.category_id
            WHERE t.user_id = $1
              AND t.category_id = $2
              AND t.transaction_date >= $3
              AND t.transaction_date < $4
              AND t.deleted_at IS NULL
              AND c.name <> 'Tiết kiệm'
            `,
            [user_id, budget.category_id, startDate, endDate]
        );
        const totalSpent = Number(spentResult.rows[0].total_spent);
        const budgetAmount = Number(budget.amount);
        const surplus = budgetAmount - totalSpent;

        if (surplus > 0) {
            // 3. Tìm các saving goals gắn với category này
            const goalsResult = await pool.query(
                `
                SELECT id, name, icon, saved_amount, target_amount, color
                FROM saving_goals
                WHERE user_id = $1 
                  AND category_id = $2 
                  AND status = 'active'
                  AND deleted_at IS NULL
                `,
                [user_id, budget.category_id]
            );
            const goals = goalsResult.rows;

            surplusList.push({
                category_id: budget.category_id,
                category_name: budget.category_name,
                category_icon: budget.category_icon,
                category_color: budget.category_color,
                budget_amount: budgetAmount,
                total_spent: totalSpent,
                surplus_amount: surplus,
                month: budget.month,
                year: budget.year,
                goals: goals,
            });
        }
    }

    return surplusList;
};
