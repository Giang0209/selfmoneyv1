// src/modules/saving-goals/types/saving-goal.type.ts

export interface CreateSavingGoalBody {
    name: string;
    icon?: string;
    target_amount: number;
    deadline?: string; // YYYY-MM-DD
    color?: string;
    category_id?: number;
}

export interface UpdateSavingGoalBody {
    name?: string;
    icon?: string;
    target_amount?: number;
    deadline?: string | null;
    color?: string;
    category_id?: number | null;
    status?: 'active' | 'completed' | 'cancelled';
}

export interface ContributeSavingGoalBody {
    wallet_id: number;
    amount: number;
    note?: string;
}
