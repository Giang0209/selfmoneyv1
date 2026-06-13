// src/modules/categories/types/category.type.ts

// Định nghĩa dữ liệu gửi lên khi tạo mới một danh mục (Category)
export interface CreateCategoryBody {
    name: string; // Tên danh mục (ví dụ: Ăn uống, Lương...) (bắt buộc)

    type: "income" | "expense"; // Loại danh mục: Thu nhập hoặc Chi tiêu (bắt buộc)

    icon?: string; // Biểu tượng danh mục dạng Emoji hoặc Tên Icon (tùy chọn)

    color?: string; // Mã màu HEX hiển thị (tùy chọn)
}

// Định nghĩa dữ liệu gửi lên khi cập nhật thông tin danh mục
export interface UpdateCategoryBody {
    category_id: number; // ID của danh mục cần chỉnh sửa

    name?: string; // Tên mới của danh mục (tùy chọn)

    type?: "income" | "expense"; // Loại mới của danh mục (tùy chọn)

    icon?: string; // Biểu tượng mới (tùy chọn)

    color?: string; // Mã màu mới (tùy chọn)
}