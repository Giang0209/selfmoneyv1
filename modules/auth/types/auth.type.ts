// src/modules/auth/types/auth.type.ts

// Định nghĩa dữ liệu gửi lên khi đăng ký tài khoản mới
export interface RegisterBody {
    phone: string; // Số điện thoại đăng ký (bắt buộc)

    password: string; // Mật khẩu (bắt buộc)

    username?: string; // Tên đăng nhập (tùy chọn)

    name?: string; // Họ tên hiển thị (tùy chọn)

    avatar?: string; // URL ảnh đại diện (tùy chọn)

    dob?: string; // Ngày sinh dạng YYYY-MM-DD (tùy chọn)

    gender?: "male" | "female" | "other"; // Giới tính (tùy chọn)
}

// Định nghĩa dữ liệu gửi lên khi đăng nhập
export interface LoginBody {
    phone: string; // Số điện thoại đăng nhập

    password: string; // Mật khẩu
}

// Định nghĩa thông tin người dùng được giải mã từ JWT Token
export interface AuthUser {
    userId: number; // ID định danh người dùng

    phone: string; // Số điện thoại người dùng
}