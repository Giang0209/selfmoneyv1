// src/modules/budgets/types/budget.type.ts

// Định nghĩa dữ liệu gửi lên khi tạo mới ngân sách (Budget)
export interface CreateBudgetBody {
    category_id: number; // ID danh mục áp dụng ngân sách (bắt buộc)

    amount: number; // Số tiền hạn mức ngân sách đặt ra (bắt buộc)

    month: number; // Tháng áp dụng ngân sách (1-12) (bắt buộc)

    year: number; // Năm áp dụng ngân sách (bắt buộc)
}

// Định nghĩa dữ liệu gửi lên khi cập nhật hạn mức ngân sách
export interface UpdateBudgetBody {
    budget_id: number; // ID của ngân sách cần chỉnh sửa

    amount?: number; // Số tiền hạn mức mới (tùy chọn)
}