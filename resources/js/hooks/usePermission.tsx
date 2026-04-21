import { usePage } from '@inertiajs/react';

interface Auth {
    user: Record<string, unknown> | null;
    permissions: string[];
}

interface PageProps {
    auth: Auth;
    [key: string]: unknown;
}

export function usePermission(permission: string): boolean {
    const { auth } = usePage<PageProps>().props;
    if (!auth?.permissions || !Array.isArray(auth.permissions)) return false;
    return auth.permissions.includes(permission);
}

export function useAnyPermission(permissions: string[]): boolean {
    const { auth } = usePage<PageProps>().props;
    if (!auth?.permissions || !Array.isArray(auth.permissions)) return false;
    return permissions.some(p => auth.permissions.includes(p));
}