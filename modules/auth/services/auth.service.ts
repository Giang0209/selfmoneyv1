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

const SALT_ROUNDS = 10;

// Validate phone: 10 số
const phoneRegex = /^[0-9]{10}$/;

// Password:
// >= 8 ký tự, có chữ hoa, có ký tự đặc biệt (KHÔNG bắt buộc số)
const passwordRegex =
    /^(?=.*[A-Z])(?=.*[^A-Za-z0-9]).{8,}$/;



// Register
export const registerService = async ({
    phone,
    password,
    username,
    name,
    avatar,
    dob,
    gender,
}: RegisterBody) => {

    // Check required
    if (!phone || !password) {
        throw new Error("Thiếu số điện thoại hoặc mật khẩu");
    }

    // Validate phone
    if (!phoneRegex.test(phone)) {
        throw new Error("Số điện thoại phải đúng 10 chữ số");
    }

    // Validate password
    if (!passwordRegex.test(password)) {
        throw new Error(
            "Password phải ≥ 8 ký tự, có chữ hoa và ký tự đặc biệt"
        );
    }

    // Check existing phone
    const existingUser = await findUserByPhone(phone);

    if (existingUser) {
        throw new Error("Số điện thoại đã tồn tại");
    }

    // Hash password
    const password_hash = await bcrypt.hash(password, SALT_ROUNDS);

    // Create user
    const user = await createUser({
        phone,
        username,
        name,
        password_hash,
        avatar,
        dob,
        gender,
    });

    // Token
    const token = await signToken({
        userId: user.id,
        phone: user.phone,
    });

    return {
        token,
        user,
    };
};


// Login
export const loginService = async ({
    phone,
    password,
}: LoginBody) => {

    // Validate input
    if (!phone || !password) {
        throw new Error("Thiếu số điện thoại hoặc mật khẩu");
    }

    // Validate phone format
    if (!phoneRegex.test(phone)) {
        throw new Error("Số điện thoại phải đúng 10 chữ số");
    }

    // Find user
    const user = await findUserByPhone(phone);

    if (!user) {
        throw new Error("Số điện thoại không tồn tại");
    }

    // Compare password
    const isMatch = await bcrypt.compare(
        password,
        user.password_hash
    );

    if (!isMatch) {
        throw new Error("Mật khẩu không đúng");
    }

    // Create token
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