// src/modules/wallets/types/wallet.type.ts

export interface CreateWalletBody {
    name: string;
    balance?: number;
    icon?: string;
}

export interface UpdateWalletBody {
    wallet_id: number;
    balance?: number;
}