// src/app/api/auth/register/route.ts

import {
    registerController,
} from "@/modules/auth/controllers/auth.controller";

export async function POST(
    req: Request
) {
    return registerController(req);
}