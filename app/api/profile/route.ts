// src/app/api/profile/route.ts

import {
    getProfileController,
    updateProfileController,
} from "@/modules/profiles/controllers/profile.controller";

export async function GET(
    req: Request
) {
    return getProfileController(req);
}

export async function PATCH(
    req: Request
) {
    return updateProfileController(req);
}