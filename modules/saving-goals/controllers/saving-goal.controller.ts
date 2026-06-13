// src/modules/saving-goals/controllers/saving-goal.controller.ts

import { requireAuth } from "@/modules/auth/middlewares/auth.middleware";
import {
    createGoalService,
    getGoalsService,
    getGoalByIdService,
    updateGoalService,
    deleteGoalService,
    contributeToGoalService,
    getGoalContributionsService,
    getBudgetSurplusService,
} from "../services/saving-goal.service";

// Tạo mới mục tiêu tiết kiệm
export const createSavingGoalController = async (req: Request) => {
    try {
        const user = await requireAuth(req);
        const body = await req.json();

        const goal = await createGoalService(user.userId, body);

        return Response.json(
            {
                message: "Tạo mục tiêu tiết kiệm thành công",
                goal,
            },
            { status: 201 }
        );
    } catch (error: any) {
        return Response.json({ message: error.message }, { status: 400 });
    }
};

// Lấy danh sách mục tiêu tiết kiệm của user
export const getSavingGoalsController = async (req: Request) => {
    try {
        const user = await requireAuth(req);
        const goals = await getGoalsService(user.userId);

        return Response.json(goals);
    } catch (error: any) {
        return Response.json({ message: error.message }, { status: 400 });
    }
};

// Cập nhật mục tiêu tiết kiệm
export const updateSavingGoalController = async (req: Request, context: any) => {
    try {
        const user = await requireAuth(req);
        const params = await context.params;
        const body = await req.json();

        const goal = await updateGoalService(user.userId, Number(params.id), body);

        return Response.json({
            message: "Cập nhật mục tiêu tiết kiệm thành công",
            goal,
        });
    } catch (error: any) {
        return Response.json({ message: error.message }, { status: 400 });
    }
};

// Xoá mục tiêu tiết kiệm
export const deleteSavingGoalController = async (req: Request, context: any) => {
    try {
        const user = await requireAuth(req);
        const params = await context.params;

        await deleteGoalService(user.userId, Number(params.id));

        return Response.json({
            message: "Xóa mục tiêu tiết kiệm thành công",
        });
    } catch (error: any) {
        return Response.json({ message: error.message }, { status: 400 });
    }
};

// Lấy lịch sử đóng góp vào mục tiêu
export const getSavingGoalContributionsController = async (req: Request, context: any) => {
    try {
        const user = await requireAuth(req);
        const params = await context.params;

        const contributions = await getGoalContributionsService(user.userId, Number(params.id));

        return Response.json(contributions);
    } catch (error: any) {
        return Response.json({ message: error.message }, { status: 400 });
    }
};

// Nạp tiền/đóng góp vào mục tiêu tiết kiệm
export const contributeSavingGoalController = async (req: Request, context: any) => {
    try {
        const user = await requireAuth(req);
        const params = await context.params;
        const body = await req.json();

        const result = await contributeToGoalService({
            user_id: user.userId,
            goal_id: Number(params.id),
            wallet_id: Number(body.wallet_id),
            amount: Number(body.amount),
            note: body.note,
        });

        return Response.json({
            message: "Nạp tiền vào mục tiêu tiết kiệm thành công",
            ...result,
        });
    } catch (error: any) {
        return Response.json({ message: error.message }, { status: 400 });
    }
};

// Lấy ngân sách danh mục còn dư cuối tháng để gợi ý chuyển dư
export const getBudgetSurplusController = async (req: Request) => {
    try {
        const user = await requireAuth(req);

        // Lấy tháng và năm từ query params
        const { searchParams } = new URL(req.url);
        const month = searchParams.get("month");
        const year = searchParams.get("year");

        if (!month || !year) {
            throw new Error("Vui lòng truyền đầy đủ tham số month và year");
        }

        const surplusList = await getBudgetSurplusService(
            user.userId,
            Number(month),
            Number(year)
        );

        return Response.json(surplusList);
    } catch (error: any) {
        return Response.json({ message: error.message }, { status: 400 });
    }
};
