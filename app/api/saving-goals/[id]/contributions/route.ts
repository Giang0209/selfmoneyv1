import {
    getSavingGoalContributionsController,
} from "@/modules/saving-goals/controllers/saving-goal.controller";

export async function GET(req: Request, context: any) {
    return getSavingGoalContributionsController(req, context);
}
