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

// Get profile
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

// Update profile
export const updateProfileService =
    async ({
        user_id,
        name,
        username,
        avatar,
        dob,
        gender,
    }: UpdateProfileBody & {
        user_id: number;
    }) => {

        const updatedProfile =
            await updateProfile({
                user_id,
                name,
                username,
                avatar,
                dob,
                gender,
            });

        return updatedProfile;
    };

// Change password
export const changePasswordService =
    async ({
        user_id,
        old_password,
        new_password,
    }: ChangePasswordBody & {
        user_id: number;
    }) => {

        if (
            !old_password ||
            !new_password
        ) {
            throw new Error(
                "Thiếu mật khẩu"
            );
        }

        if (
            new_password.length < 6
        ) {
            throw new Error(
                "Mật khẩu mới phải >= 6 ký tự"
            );
        }

        const user =
            await getPasswordByUserId(
                user_id
            );

        if (!user) {
            throw new Error(
                "User không tồn tại"
            );
        }

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

        const newHash =
            await bcrypt.hash(
                new_password,
                10
            );

        await updatePassword({
            user_id,
            password_hash:
                newHash,
        });

        return true;
    };