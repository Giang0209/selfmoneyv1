import {
    createSavingGoalController,
    getSavingGoalsController,
} from "@/modules/saving-goals/controllers/saving-goal.controller";

export async function GET(req: Request) {
    return getSavingGoalsController(req);
}

export async function POST(req: Request) {
    return createSavingGoalController(req);
}
