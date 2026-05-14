// src/app/api/profile/password/route.ts

import {
    changePasswordController,
} from "@/modules/profiles/controllers/profile.controller";

export async function PATCH(
    req: Request
) {
    return changePasswordController(req);
}