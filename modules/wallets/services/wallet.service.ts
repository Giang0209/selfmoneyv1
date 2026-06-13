// src/modules/wallets/services/wallet.service.ts
// Tầng Service - xử lý logic nghiệp vụ cho ví

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

// Dịch vụ tạo ví mới
export const createWalletService = async ({
    user_id,
    name,
    balance,
    icon,
}: CreateWalletBody & {
    user_id: number;
}) => {

    // Loại bỏ khoảng trắng và kiểm tra tên ví
    const cleanName = name?.trim();

    if (!cleanName) {
        throw new Error("Tên tài khoản là bắt buộc");
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

// Dịch vụ lấy danh sách ví của người dùng
export const getWalletsService =
    async (user_id: number) => {

        return await getWalletsByUserId(
            user_id
        );
    };

// Dịch vụ cập nhật số dư ví
export const updateWalletService =
    async ({
        user_id,
        wallet_id,
        balance,
    }: UpdateWalletBody & {
        user_id: number;
    }) => {

        // Kiểm tra ví tồn tại và thuộc quyền người dùng
        const wallet =
            await findWalletById({
                wallet_id,
                user_id,
            });

        if (!wallet) {

            throw new Error(
                "Tài khoản không tồn tại"
            );
        }

        return await updateWallet({
            wallet_id,
            balance,
        });
    };

// Dịch vụ xoá mềm ví
export const deleteWalletService =
    async ({
        wallet_id,
        user_id,
    }: {
        wallet_id: number;
        user_id: number;
    }) => {

        // Kiểm tra ví tồn tại và thuộc quyền người dùng
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