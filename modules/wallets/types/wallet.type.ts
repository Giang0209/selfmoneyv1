// src/modules/wallets/types/wallet.type.ts

// Dữ liệu tạo ví mới
export interface CreateWalletBody {
    name: string; // Tên ví (bắt buộc)
    balance?: number; // Số dư ban đầu (mặc định 0)
    icon?: string; // Icon hiển thị (tùy chọn)
}

// Dữ liệu cập nhật ví
export interface UpdateWalletBody {
    wallet_id: number; // ID ví cần cập nhật
    balance?: number; // Số dư mới
}