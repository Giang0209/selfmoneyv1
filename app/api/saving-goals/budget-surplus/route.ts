import {
    getBudgetSurplusController,
} from "@/modules/saving-goals/controllers/saving-goal.controller";

export async function GET(req: Request) {
    return getBudgetSurplusController(req);
}
