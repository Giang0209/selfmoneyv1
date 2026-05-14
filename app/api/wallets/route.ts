// src/app/api/wallets/route.ts

import {
    createWalletController,
    getWalletsController,
} from "@/modules/wallets/controllers/wallet.controller";

export async function POST(
    req: Request
) {
    return createWalletController(req);
}

export async function GET(
    req: Request
) {
    return getWalletsController(req);
}