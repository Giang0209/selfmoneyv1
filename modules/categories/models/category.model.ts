// src/modules/categories/models/category.model.ts

import pool from "@/lib/db";

// Create category
export const createCategory = async ({
    user_id,
    name,
    type,
    icon,
    color,
}: {
    user_id: number;

    name: string;

    type: "income" | "expense";

    icon?: string;

    color?: string;
}) => {

    const result = await pool.query(
        `
        INSERT INTO categories (
            user_id,
            name,
            type,
            icon,
            color
        )

        VALUES ($1, $2, $3, $4, $5)

        RETURNING *
        `,
        [
            user_id,
            name,
            type,
            icon || null,
            color || null,
        ]
    );

    return result.rows[0];
};

// Get categories by user
export const getCategoriesByUserId =
    async (
        user_id: number
    ) => {

        const result = await pool.query(
            `
            SELECT
                c.*,

                COALESCE(
                    SUM(t.amount),
                    0
                ) AS total_amount

            FROM categories c

            LEFT JOIN transactions t
                ON t.category_id = c.id

            WHERE
                c.user_id = $1

                AND c.deleted_at IS NULL

            GROUP BY
                c.id

            ORDER BY c.created_at DESC
            `,
            [user_id]
        );

        return result.rows;
    };

// Find category by color
export const findCategoryByColor = async ({
    user_id,
    type,
    color,
}: {
    user_id: number;
    type: "income" | "expense";
    color: string;
}) => {

    const result = await pool.query(
        `
        SELECT *
        FROM categories
        WHERE user_id = $1
        AND type = $2
        AND color = $3
        AND deleted_at IS NULL
        LIMIT 1
        `,
        [user_id, type, color]
    );

    return result.rows[0];
};

// Find category by id
export const findCategoryById =
    async (
        category_id: number
    ) => {

        const result = await pool.query(
            `
            SELECT *

            FROM categories

            WHERE id = $1
            `,
            [category_id]
        );

        return result.rows[0];
    };

// Find category by name
export const findCategoryByName =
    async ({
        user_id,
        name,
    }: {
        user_id: number;

        name: string;
    }) => {

        const result = await pool.query(
            `
            SELECT *

            FROM categories

            WHERE
                user_id = $1

                AND name = $2

                AND deleted_at IS NULL
            `,
            [
                user_id,
                name,
            ]
        );

        return result.rows[0];
    };


// Soft delete category
export const softDeleteCategory =
    async (
        category_id: number
    ) => {

        await pool.query(
            `
            UPDATE categories

            SET deleted_at = NOW()

            WHERE id = $1
            `,
            [category_id]
        );
    };