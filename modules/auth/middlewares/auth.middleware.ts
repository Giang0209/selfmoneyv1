// src/modules/auth/middleware/auth.middleware.ts

import {
    verifyToken,
} from "../utils/auth.util";

import {
    findUserById,
} from "../models/auth.model";

// Middleware kiểm tra quyền đăng nhập (Yêu cầu Token xác thực)
export const requireAuth =
    async (req: Request) => {

        // Lấy thông tin tiêu đề Authorization trong headers
        const authHeader =
            req.headers.get(
                "authorization"
            );

        if (!authHeader) {
            throw new Error(
                "Unauthorized"
            );
        }

        // Tách chuỗi Bearer <Token> lấy mã JWT Token
        const token =
            authHeader.split(" ")[1];

        if (!token) {
            throw new Error(
                "Token missing"
            );
        }

        // Tiến hành giải mã và xác thực tính hợp lệ của Token
        const decoded =
            await verifyToken(token);

        if (!decoded) {
            throw new Error(
                "Invalid token"
            );
        }

        // Đối chiếu cơ sở dữ liệu để chắc chắn người dùng vẫn tồn tại trong hệ thống
        const user =
            await findUserById(
                decoded.userId
            );

        if (!user) {
            throw new Error(
                "User not found"
            );
        }

        // Trả về thông tin giải mã thành công (chứa userId, phone) để dùng cho các bước xử lý sau
        return decoded;
    };