// src/modules/auth/services/auth.service.ts

import bcrypt from "bcrypt";

import {
    createUser,
    findUserByPhone,
} from "../models/auth.model";

import {
    LoginBody,
    RegisterBody,
} from "../types/auth.type";

import {
    signToken,
} from "../utils/auth.util";

// Số vòng băm mật khẩu của thư viện bcrypt
const SALT_ROUNDS = 10;

// Định dạng số điện thoại hợp lệ: Phải gồm đúng 10 ký tự số
const phoneRegex = /^[0-9]{10}$/;

// Định dạng mật khẩu hợp lệ: Phải có ít nhất 8 ký tự, chứa tối thiểu 1 chữ in hoa và 1 ký tự đặc biệt
const passwordRegex =
    /^(?=.*[A-Z])(?=.*[^A-Za-z0-9]).{8,}$/;



// Nghiệp vụ đăng ký tài khoản (Register)
export const registerService = async ({
    phone,
    password,
    username,
    name,
    avatar,
    dob,
    gender,
}: RegisterBody) => {

    // Kiểm tra dữ liệu đầu vào bắt buộc
    if (!phone || !password) {
        throw new Error("Thiếu số điện thoại hoặc mật khẩu");
    }

    // Kiểm tra định dạng số điện thoại
    if (!phoneRegex.test(phone)) {
        throw new Error("Số điện thoại phải đúng 10 chữ số");
    }

    // Kiểm tra tính bảo mật của mật khẩu
    if (!passwordRegex.test(password)) {
        throw new Error(
            "Password phải ≥ 8 ký tự, có chữ hoa và ký tự đặc biệt"
        );
    }

    // Kiểm tra số điện thoại đã được đăng ký trước đó hay chưa
    const existingUser = await findUserByPhone(phone);

    if (existingUser) {
        throw new Error("Số điện thoại đã tồn tại");
    }

    // Thực hiện mã hóa mật khẩu bằng bcrypt trước khi lưu
    const password_hash = await bcrypt.hash(password, SALT_ROUNDS);

    // Lưu người dùng mới vào cơ sở dữ liệu
    const user = await createUser({
        phone,
        username,
        name,
        password_hash,
        avatar,
        dob,
        gender,
    });

    // Tạo JWT Token phục vụ cho việc tự động đăng nhập ngay sau khi đăng ký
    const token = await signToken({
        userId: user.id,
        phone: user.phone,
    });

    return {
        token,
        user,
    };
};


// Nghiệp vụ đăng nhập tài khoản (Login)
export const loginService = async ({
    phone,
    password,
}: LoginBody) => {

    // Kiểm tra dữ liệu đầu vào bắt buộc
    if (!phone || !password) {
        throw new Error("Thiếu số điện thoại hoặc mật khẩu");
    }

    // Kiểm tra định dạng số điện thoại
    if (!phoneRegex.test(phone)) {
        throw new Error("Số điện thoại phải đúng 10 chữ số");
    }

    // Tìm kiếm thông tin người dùng trong cơ sở dữ liệu dựa trên số điện thoại
    const user = await findUserByPhone(phone);

    if (!user) {
        throw new Error("Số điện thoại không tồn tại");
    }

    // So sánh đối chiếu mật khẩu nhập vào với mã hash trong DB
    const isMatch = await bcrypt.compare(
        password,
        user.password_hash
    );

    if (!isMatch) {
        throw new Error("Mật khẩu không đúng");
    }

    // Tạo JWT Token phục vụ lưu phiên đăng nhập của người dùng ở Client
    const token = await signToken({
        userId: user.id,
        phone: user.phone,
    });

    return {
        token,
        user: {
            id: user.id,
            phone: user.phone,
            username: user.username,
            name: user.name,
            avatar: user.avatar,
            dob: user.dob,
            gender: user.gender,
            created_at: user.created_at,
        },
    };
};