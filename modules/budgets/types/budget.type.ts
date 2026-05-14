// src/modules/budgets/types/budget.type.ts

export interface CreateBudgetBody {
    category_id: number;

    amount: number;

    month: number;

    year: number;
}

export interface UpdateBudgetBody {
    budget_id: number;

    amount?: number;
}