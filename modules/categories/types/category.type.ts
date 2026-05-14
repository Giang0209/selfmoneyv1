// src/modules/categories/types/category.type.ts

export interface CreateCategoryBody {
    name: string;

    type: "income" | "expense";

    icon?: string;

    color?: string;
}

export interface UpdateCategoryBody {
    category_id: number;

    name?: string;

    type?: "income" | "expense";

    icon?: string;

    color?: string;
}