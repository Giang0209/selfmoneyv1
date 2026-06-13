// src/modules/budgets/models/budget.model.ts

import pool from "@/lib/db";

// Tạo mới một bản ghi ngân sách trong cơ sở dữ liệu
export const createBudget = async ({
    user_id,
    category_id,
    amount,
    month,
    year,
}: {
    user_id: number;

    category_id: number;

    amount: number;

    month: number;

    year: number;
}) => {

    const result = await pool.query(
        `
        INSERT INTO budgets (
            user_id,
            category_id,
            amount,
            month,
            year
        )

        VALUES ($1, $2, $3, $4, $5)

        RETURNING *
        `,
        [
            user_id,
            category_id,
            amount,
            month,
            year,
        ]
    );

    return result.rows[0];
};

// Lấy toàn bộ danh sách ngân sách của người dùng, liên kết (Join) với bảng danh mục để lấy thông tin hiển thị
export const getBudgetsByUserId =
    async (
        user_id: number
    ) => {

        const result = await pool.query(
            `
            SELECT
                b.*,

                c.name AS category_name,

                c.icon AS category_icon,

                c.color AS category_color

            FROM budgets b

            INNER JOIN categories c
                ON c.id = b.category_id

            WHERE
                b.user_id = $1

                AND b.deleted_at IS NULL

            ORDER BY
                b.year DESC,
                b.month DESC
            `,
            [user_id]
        );

        return result.rows;
    };

// Tìm kiếm ngân sách dựa trên ID ngân sách
export const findBudgetById =
    async (
        budget_id: number
    ) => {

        const result = await pool.query(
            `
            SELECT *

            FROM budgets

            WHERE id = $1
            `,
            [budget_id]
        );

        return result.rows[0];
    };

// Tìm kiếm ngân sách trùng lặp (tránh việc một danh mục chi tiêu có 2 hạn mức ngân sách trong cùng một tháng)
export const findBudgetDuplicate =
    async ({
        user_id,
        category_id,
        month,
        year,
    }: {
        user_id: number;

        category_id: number;

        month: number;

        year: number;
    }) => {

        const result = await pool.query(
            `
            SELECT *

            FROM budgets

            WHERE
                user_id = $1

                AND category_id = $2

                AND month = $3

                AND year = $4

                AND deleted_at IS NULL
            `,
            [
                user_id,
                category_id,
                month,
                year,
            ]
        );

        return result.rows[0];
    };

// Cập nhật số tiền hạn mức ngân sách
export const updateBudget = async ({
    budget_id,
    amount,
}: {
    budget_id: number;

    amount?: number;
}) => {

    const result = await pool.query(
        `
        UPDATE budgets

        SET
            amount = COALESCE($1, amount),

            updated_at = NOW()

        WHERE id = $2

        RETURNING *
        `,
        [
            amount || null,
            budget_id,
        ]
    );

    return result.rows[0];
};

// Thực hiện xóa mềm ngân sách bằng cách cập nhật cột deleted_at
export const softDeleteBudget =
    async (
        budget_id: number
    ) => {

        await pool.query(
            `
            UPDATE budgets

            SET deleted_at = NOW()

            WHERE id = $1
            `,
            [budget_id]
        );
    };