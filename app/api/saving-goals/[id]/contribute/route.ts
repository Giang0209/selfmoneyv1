import {
    contributeSavingGoalController,
} from "@/modules/saving-goals/controllers/saving-goal.controller";

export async function POST(req: Request, context: any) {
    return contributeSavingGoalController(req, context);
}
