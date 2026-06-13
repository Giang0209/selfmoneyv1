// src/modules/saving-goals/models/saving-goal.model.ts

import pool from "@/lib/db";

// Tạo mục tiêu tiết kiệm mới
export const createSavingGoal = async ({
    user_id,
    category_id,
    name,
    icon,
    target_amount,
    deadline,
    color,
}: {
    user_id: number;
    category_id?: number | null;
    name: string;
    icon?: string;
    target_amount: number;
    deadline?: string | null;
    color?: string;
}) => {
    const result = await pool.query(
        `
        INSERT INTO saving_goals (
            user_id,
            category_id,
            name,
            icon,
            target_amount,
            deadline,
            color
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING *
        `,
        [
            user_id,
            category_id || null,
            name,
            icon || null,
            target_amount,
            deadline || null,
            color || 'violet',
        ]
    );
    return result.rows[0];
};

// Lấy danh sách mục tiêu tiết kiệm của người dùng
export const getSavingGoalsByUserId = async (user_id: number) => {
    const result = await pool.query(
        `
        SELECT 
            sg.*,
            c.name AS category_name,
            c.icon AS category_icon,
            c.color AS category_color
        FROM saving_goals sg
        LEFT JOIN categories c ON c.id = sg.category_id
        WHERE sg.user_id = $1 AND sg.deleted_at IS NULL
        ORDER BY sg.created_at DESC
        `,
        [user_id]
    );
    return result.rows;
};

// Tìm mục tiêu tiết kiệm theo ID
export const findSavingGoalById = async (goal_id: number) => {
    const result = await pool.query(
        `
        SELECT * FROM saving_goals
        WHERE id = $1 AND deleted_at IS NULL
        `,
        [goal_id]
    );
    return result.rows[0];
};

// Cập nhật mục tiêu tiết kiệm
export const updateSavingGoal = async ({
    goal_id,
    name,
    icon,
    target_amount,
    deadline,
    color,
    status,
    category_id,
}: {
    goal_id: number;
    name?: string;
    icon?: string;
    target_amount?: number;
    deadline?: string | null;
    color?: string;
    status?: 'active' | 'completed' | 'cancelled';
    category_id?: number | null;
}) => {
    const result = await pool.query(
        `
        UPDATE saving_goals
        SET
            name = COALESCE($1, name),
            icon = COALESCE($2, icon),
            target_amount = COALESCE($3, target_amount),
            deadline = CASE WHEN $4 = 'keep' THEN deadline ELSE $5 END,
            color = COALESCE($6, color),
            status = COALESCE($7, status),
            category_id = CASE WHEN $8 = 'keep' THEN category_id ELSE $9 END,
            updated_at = NOW()
        WHERE id = $10 AND deleted_at IS NULL
        RETURNING *
        `,
        [
            name || null,
            icon || null,
            target_amount || null,
            deadline === undefined ? 'keep' : 'set',
            deadline || null,
            color || null,
            status || null,
            category_id === undefined ? 'keep' : 'set',
            category_id || null,
            goal_id,
        ]
    );
    return result.rows[0];
};

// Cập nhật số tiền đã lưu của mục tiêu
export const updateSavingGoalSavedAmount = async (goal_id: number, amount: number) => {
    const result = await pool.query(
        `
        UPDATE saving_goals
        SET saved_amount = saved_amount + $1,
            status = CASE 
                WHEN saved_amount + $1 >= target_amount THEN 'completed'::VARCHAR
                ELSE status
            END,
            updated_at = NOW()
        WHERE id = $2 AND deleted_at IS NULL
        RETURNING *
        `,
        [amount, goal_id]
    );
    return result.rows[0];
};

// Xoá mềm mục tiêu tiết kiệm
export const softDeleteSavingGoal = async (goal_id: number) => {
    await pool.query(
        `
        UPDATE saving_goals
        SET deleted_at = NOW()
        WHERE id = $1
        `,
        [goal_id]
    );
};

// Thêm lịch sử đóng góp vào mục tiêu
export const addSavingContribution = async ({
    goal_id,
    user_id,
    transaction_id,
    amount,
    note,
}: {
    goal_id: number;
    user_id: number;
    transaction_id?: number | null;
    amount: number;
    note?: string | null;
}) => {
    const result = await pool.query(
        `
        INSERT INTO saving_contributions (
            goal_id,
            user_id,
            transaction_id,
            amount,
            note
        )
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *
        `,
        [
            goal_id,
            user_id,
            transaction_id || null,
            amount,
            note || null,
        ]
    );
    return result.rows[0];
};

// Lấy lịch sử đóng góp của mục tiêu tiết kiệm
export const getSavingContributionsByGoalId = async (goal_id: number) => {
    const result = await pool.query(
        `
        SELECT 
            sc.*,
            t.wallet_id,
            w.name AS wallet_name
        FROM saving_contributions sc
        LEFT JOIN transactions t ON t.id = sc.transaction_id
        LEFT JOIN wallets w ON w.id = t.wallet_id
        WHERE sc.goal_id = $1
        ORDER BY sc.contributed_at DESC
        `,
        [goal_id]
    );
    return result.rows;
};
