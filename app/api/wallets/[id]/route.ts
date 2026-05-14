// src/app/api/wallets/[id]/route.ts

import {
    deleteWalletController,
    updateWalletController,
} from "@/modules/wallets/controllers/wallet.controller";

export async function PATCH(
    req: Request,
    context: {
        params: Promise<{
            id: string;
        }>;
    }
) {
    return updateWalletController(
        req,
        context
    );
}

export async function DELETE(
    req: Request,
    context: {
        params: Promise<{
            id: string;
        }>;
    }
) {
    return deleteWalletController(
        req,
        context
    );
}