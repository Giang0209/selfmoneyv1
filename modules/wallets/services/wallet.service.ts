// src/modules/wallets/services/wallet.service.ts

import {
    createWallet,
    deleteWallet,
    findWalletById,
    getWalletsByUserId,
    updateWallet,
} from "../models/wallet.model";

import {
    CreateWalletBody,
    UpdateWalletBody,
} from "../types/wallet.type";

// Create wallet
export const createWalletService = async ({
    user_id,
    name,
    balance,
    icon,
}: CreateWalletBody & {
    user_id: number;
}) => {

    const cleanName = name?.trim();

    if (!cleanName) {
        throw new Error("Tên ví là bắt buộc");
    }

    const wallet =
        await createWallet({
            user_id,
            name: cleanName,
            balance,
            icon,
        });

    return wallet;
};

// Get wallets
export const getWalletsService =
    async (user_id: number) => {

        return await getWalletsByUserId(
            user_id
        );
    };

// Update wallet
export const updateWalletService =
    async ({
        user_id,
        wallet_id,
        balance,
    }: UpdateWalletBody & {
        user_id: number;
    }) => {

        const wallet =
            await findWalletById({
                wallet_id,
                user_id,
            });

        if (!wallet) {

            throw new Error(
                "Ví không tồn tại"
            );
        }

        return await updateWallet({
            wallet_id,
            balance,
        });
    };

// Delete wallet
export const deleteWalletService =
    async ({
        wallet_id,
        user_id,
    }: {
        wallet_id: number;
        user_id: number;
    }) => {

        const wallet =
            await findWalletById({
                wallet_id,
                user_id,
            });

        if (!wallet) {
            throw new Error(
                "Ví không tồn tại"
            );
        }

        await deleteWallet(wallet_id);

        return true;
    };