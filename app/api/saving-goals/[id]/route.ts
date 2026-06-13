import {
    updateSavingGoalController,
    deleteSavingGoalController,
} from "@/modules/saving-goals/controllers/saving-goal.controller";

export async function PATCH(req: Request, context: any) {
    return updateSavingGoalController(req, context);
}

export async function DELETE(req: Request, context: any) {
    return deleteSavingGoalController(req, context);
}
