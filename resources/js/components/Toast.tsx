import { useEffect, useState } from 'react';
import { usePage } from '@inertiajs/react';

interface ToastData {
    id: number;
    type: 'success' | 'error' | 'warning';
    message: string;
}

interface PageProps {
    flash: {
        success?: string;
        error?: string;
    };
    [key: string]: unknown;
}

export function useToast() {
    const [toasts, setToasts] = useState<ToastData[]>([]);

    const add = (message: string, type: ToastData['type'] = 'success') => {
        const id = Date.now();
        setToasts(prev => [...prev, { id, type, message }]);
        setTimeout(() => {
            setToasts(prev => prev.filter(t => t.id !== id));
        }, 4000);
    };

    const remove = (id: number) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    };

    return { toasts, add, remove };
}

const colors: Record<ToastData['type'], string> = {
    success: 'bg-green-500',
    error: 'bg-red-500',
    warning: 'bg-yellow-500',
};

const icons: Record<ToastData['type'], string> = {
    success: '✓',
    error: '✕',
    warning: '⚠',
};

interface ToastContainerProps {
    toasts: ToastData[];
    remove: (id: number) => void;
}

export function ToastContainer({ toasts, remove }: ToastContainerProps) {
    return (
        <div className="fixed top-4 right-4 z-50 flex flex-col gap-2">
            {toasts.map(toast => (
                <div
                    key={toast.id}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg text-white shadow-lg min-w-64 ${colors[toast.type]}`}
                >
                    <span className="font-bold">{icons[toast.type]}</span>
                    <span className="flex-1 text-sm">{toast.message}</span>
                    <button
                        onClick={() => remove(toast.id)}
                        className="text-white/80 hover:text-white text-lg leading-none"
                    >
                        ×
                    </button>
                </div>
            ))}
        </div>
    );
}

// Auto-reads from Inertia flash and fires toasts
export function FlashToast({ add }: { add: (msg: string, type: ToastData['type']) => void }) {
    const { flash } = usePage<PageProps>().props;

    useEffect(() => {
        if (flash?.success) add(flash.success, 'success');
        
        if (flash?.error) add(flash.error, 'error');
    }, [flash]);

    return null;
}