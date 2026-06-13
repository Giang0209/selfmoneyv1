// src/modules/profiles/types/profile.type.ts

// Định nghĩa dữ liệu gửi lên khi cập nhật thông tin hồ sơ cá nhân (Profile)
export interface UpdateProfileBody {
    name?: string; // Họ tên hiển thị mới (tùy chọn)

    username?: string; // Tên đăng nhập mới (tùy chọn)

    avatar?: string; // URL ảnh đại diện mới (tùy chọn)

    dob?: string; // Ngày sinh mới (tùy chọn)

    gender?: "male" | "female" | "other"; // Giới tính mới (tùy chọn)
}

// Định nghĩa dữ liệu gửi lên khi yêu cầu thay đổi mật khẩu
export interface ChangePasswordBody {
    old_password: string; // Mật khẩu hiện tại/cũ (bắt buộc)

    new_password: string; // Mật khẩu mới mong muốn thiết lập (bắt buộc)
}