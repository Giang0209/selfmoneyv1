// src/modules/profiles/types/profile.type.ts

export interface UpdateProfileBody {
    name?: string;

    username?: string;

    avatar?: string;

    dob?: string;

    gender?: "male" | "female" | "other";
}

export interface ChangePasswordBody {
    old_password: string;

    new_password: string;
}