// src/modules/auth/utils/auth.util.ts

import {
    SignJWT,
    jwtVerify,
} from "jose";

import {
    AuthUser,
} from "../types/auth.type";

// Lấy khoá bí mật JWT từ biến môi trường
const JWT_SECRET =
    process.env.JWT_SECRET;

if (!JWT_SECRET) {
    throw new Error(
        "JWT_SECRET is not defined"
    );
}

// Chuyển đổi khoá bí mật thành định dạng nhị phân UTF-8 phù hợp với thư viện jose
const secretKey =
    new TextEncoder().encode(
        JWT_SECRET
    );

// Tạo JWT Token có thời hạn sử dụng 7 ngày chứa thông tin định danh
export async function signToken(
    payload: AuthUser
): Promise<string> {
    return await new SignJWT({
        ...payload,
    })
        .setProtectedHeader({
            alg: "HS256", // Sử dụng thuật toán mã hoá đối xứng HMAC SHA-256
        })
        .setIssuedAt()
        .setExpirationTime("7d") // Đặt thời gian hết hạn là 7 ngày
        .sign(secretKey);
}

// Xác thực tính hợp lệ của JWT Token và giải mã lấy dữ liệu payload người dùng
export async function verifyToken(
    token: string
): Promise<AuthUser | null> {
    try {
        const { payload } =
            await jwtVerify(
                token,
                secretKey
            );

        return payload as unknown as AuthUser;
    } catch (error) {
        // Trả về null nếu token hết hạn, bị thay đổi hoặc không hợp lệ
        return null;
    }
}