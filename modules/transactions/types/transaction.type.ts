// src/modules/transactions/types/transaction.type.ts

// Định nghĩa dữ liệu gửi lên khi tạo mới một giao dịch (Transaction)
export interface CreateTransactionBody {
    wallet_id: number; // ID ví thực hiện giao dịch (bắt buộc)

    category_id: number; // ID danh mục thu/chi áp dụng cho giao dịch (bắt buộc)

    amount: number; // Số tiền giao dịch (bắt buộc)

    note?: string; // Ghi chú đính kèm giao dịch (tùy chọn)

    transaction_date: string; // Thời gian phát sinh giao dịch dạng ISO (bắt buộc)
}

// Định nghĩa dữ liệu gửi lên khi cập nhật thông tin giao dịch
export interface UpdateTransactionBody {
    transaction_id: number; // ID giao dịch cần chỉnh sửa
    amount?: number; // Số tiền mới (tùy chọn)
    note?: string; // Ghi chú mới (tùy chọn)
}