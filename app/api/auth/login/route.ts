// src/app/api/auth/login/route.ts

import {
    loginController,
} from "@/modules/auth/controllers/auth.controller";

export async function POST(
    req: Request
) {
    return loginController(req);
}