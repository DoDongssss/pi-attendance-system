import { InputHTMLAttributes } from 'react';

interface Props extends InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
}

export function TextInput({ label, error, className = '', ...props }: Props) {
    return (
        <div className="flex flex-col gap-1">
            {label && (
                <label className="text-sm font-medium text-gray-700">{label}</label>
            )}
            <input
                {...props}
                className={`rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition
                    ${error ? 'border-red-400 focus:ring-red-400' : 'border-gray-300'}
                    ${className}`}
            />
            {error && <p className="text-xs text-red-500">{error}</p>}
        </div>
    );
}