// src/modules/auth/types/auth.type.ts

export interface RegisterBody {
    phone: string;

    password: string;

    username?: string;

    name?: string;

    avatar?: string;

    dob?: string;

    gender?: "male" | "female" | "other";
}

export interface LoginBody {
    phone: string;

    password: string;
}

export interface AuthUser {
    userId: number;

    phone: string;
}