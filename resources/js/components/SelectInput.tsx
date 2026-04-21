import { SelectHTMLAttributes } from 'react';

interface Option {
    value: string;
    label: string;
}

interface Props extends SelectHTMLAttributes<HTMLSelectElement> {
    label?: string;
    error?: string;
    options: Option[];
    placeholder?: string;
}

export function SelectInput({ label, error, options, placeholder, className = '', ...props }: Props) {
    return (
        <div className="flex flex-col gap-1">
            {label && (
                <label className="text-sm font-medium text-gray-700">{label}</label>
            )}
            <select
                {...props}
                className={`rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition bg-white
                    ${error ? 'border-red-400 focus:ring-red-400' : 'border-gray-300'}
                    ${className}`}
            >
                {placeholder && (
                    <option value="">{placeholder}</option>
                )}
                {options.map(opt => (
                    <option key={opt.value} value={opt.value}>
                        {opt.label}
                    </option>
                ))}
            </select>
            {error && <p className="text-xs text-red-500">{error}</p>}
        </div>
    );
}