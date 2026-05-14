// src/app/api/budgets/[id]/route.ts

import {
    deleteBudgetController,
    updateBudgetController,
} from "@/modules/budgets/controllers/budget.controller";

export async function PATCH(
    req: Request,
    context: {
        params: Promise<{
            id: string;
        }>;
    }
) {
    return updateBudgetController(
        req,
        context
    );
}

export async function DELETE(
    req: Request,
    context: {
        params: Promise<{
            id: string;
        }>;
    }
) {
    return deleteBudgetController(
        req,
        context
    );
}