// src/app/api/budgets/route.ts

import {
    createBudgetController,
    getBudgetsController,
} from "@/modules/budgets/controllers/budget.controller";

export async function GET(
    req: Request
) {
    return getBudgetsController(req);
}

export async function POST(
    req: Request
) {
    return createBudgetController(req);
}