export interface User {
    id: number;
    name: string;
    email: string;
}

export interface Auth {
    user: User;
    permissions: string[];
}

export interface Flash {
    success?: string;
    error?: string;
}

export interface PageProps {
    auth: Auth;
    flash: Flash;
    [key: string]: unknown;
}