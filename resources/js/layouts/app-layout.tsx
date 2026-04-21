import AppLayoutTemplate from '@/layouts/app/app-sidebar-layout';
import { ToastContainer, FlashToast, useToast } from '@/components/Toast';
import type { BreadcrumbItem } from '@/types';

export default function AppLayout({
    breadcrumbs = [],
    children,
}: {
    breadcrumbs?: BreadcrumbItem[];
    children: React.ReactNode;
}) {
    const { toasts, add, remove } = useToast();

    return (
        <AppLayoutTemplate breadcrumbs={breadcrumbs}>
            <FlashToast add={add} />
            <ToastContainer toasts={toasts} remove={remove} />
            {children}
        </AppLayoutTemplate>
    );
}