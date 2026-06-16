// src/modules/profiles/services/profile.service.ts

import bcrypt from "bcrypt";

import {
    getPasswordByUserId,
    getProfileById,
    updatePassword,
    updateProfile,
} from "../models/profile.model";

import {
    ChangePasswordBody,
    UpdateProfileBody,
} from "../types/profile.type";

// Dịch vụ lấy thông tin hồ sơ cá nhân của người dùng
export const getProfileService =
    async (user_id: number) => {

        const profile =
            await getProfileById(
                user_id
            );

        if (!profile) {
            throw new Error(
                "User không tồn tại"
            );
        }

        return profile;
    };

// Dịch vụ cập nhật thông tin hồ sơ cá nhân
export const updateProfileService =
    async ({
        user_id,
        name,
        avatar,
        dob,
        gender,
    }: UpdateProfileBody & {
        user_id: number;
    }) => {

        // Gọi model thực hiện cập nhật thông tin trong DB
        const updatedProfile =
            await updateProfile({
                user_id,
                name,
                avatar,
                dob,
                gender,
            });

        return updatedProfile;
    };

// Dịch vụ thay đổi mật khẩu tài khoản
export const changePasswordService =
    async ({
        user_id,
        old_password,
        new_password,
    }: ChangePasswordBody & {
        user_id: number;
    }) => {

        // Kiểm tra xem đã nhập đầy đủ mật khẩu cũ và mới chưa
        if (
            !old_password ||
            !new_password
        ) {
            throw new Error(
                "Thiếu mật khẩu"
            );
        }

        // Kiểm tra độ dài mật khẩu mới tối thiểu là 6 ký tự
        if (
            new_password.length < 6
        ) {
            throw new Error(
                "Mật khẩu mới phải >= 6 ký tự"
            );
        }

        // Tìm thông tin người dùng trong cơ sở dữ liệu
        const user =
            await getPasswordByUserId(
                user_id
            );

        if (!user) {
            throw new Error(
                "User không tồn tại"
            );
        }

        // Tiến hành đối chiếu mật khẩu cũ nhập vào với mật khẩu băm hiện tại trong cơ sở dữ liệu
        const isMatch =
            await bcrypt.compare(
                old_password,
                user.password_hash
            );

        if (!isMatch) {
            throw new Error(
                "Mật khẩu cũ không đúng"
            );
        }

        // Thực hiện băm mật khẩu mới bằng bcrypt
        const newHash =
            await bcrypt.hash(
                new_password,
                10
            );

        // Cập nhật mật khẩu băm mới vào cơ sở dữ liệu
        await updatePassword({
            user_id,
            password_hash:
                newHash,
        });

        return true;
    };