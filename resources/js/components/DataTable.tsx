import { Link } from '@inertiajs/react';

interface Column<T> {
    key: string;
    label: string;
    render?: (row: T) => React.ReactNode;
}

interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

interface PaginatedData<T> {
    data: T[];
    links: PaginationLink[];
    from: number;
    to: number;
    total: number;
}

interface Props<T> {
    columns: Column<T>[];
    data: PaginatedData<T>;
    actions?: (row: T) => React.ReactNode;
    emptyMessage?: string;
}

export default function DataTable<T extends { id: number }>({
    columns,
    data,
    actions,
    emptyMessage = 'No records found.',
}: Props<T>) {
    return (
        <div className="flex flex-col gap-4">
            {/* Table */}
            <div className="overflow-x-auto rounded-xl border border-gray-200">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            {columns.map(col => (
                                <th
                                    key={col.key}
                                    className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider"
                                >
                                    {col.label}
                                </th>
                            ))}
                            {actions && (
                                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                    Actions
                                </th>
                            )}
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-100">
                        {data.data.length === 0 ? (
                            <tr>
                                <td
                                    colSpan={columns.length + (actions ? 1 : 0)}
                                    className="px-4 py-8 text-center text-sm text-gray-400"
                                >
                                    {emptyMessage}
                                </td>
                            </tr>
                        ) : (
                            data.data.map(row => (
                                <tr key={row.id} className="hover:bg-gray-50 transition">
                                    {columns.map(col => (
                                        <td key={col.key} className="px-4 py-3 text-sm text-gray-700">
                                            {col.render
                                                ? col.render(row)
                                                : String((row as Record<string, unknown>)[col.key] ?? '—')}
                                        </td>
                                    ))}
                                    {actions && (
                                        <td className="px-4 py-3 text-right">
                                            {actions(row)}
                                        </td>
                                    )}
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between text-sm text-gray-500">
                <span>
                    Showing {data.from ?? 0}–{data.to ?? 0} of {data.total} results
                </span>
                <div className="flex gap-1">
                    {data.links.map((link, i) => (
                        link.url ? (
                            <Link
                                key={i}
                                href={link.url}
                                className={`px-3 py-1 rounded-lg border text-sm transition ${
                                    link.active
                                        ? 'bg-blue-600 text-white border-blue-600'
                                        : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                                }`}
                                dangerouslySetInnerHTML={{ __html: link.label }}
                            />
                        ) : (
                            <span
                                key={i}
                                className="px-3 py-1 rounded-lg border text-sm bg-gray-50 text-gray-300 border-gray-100 cursor-not-allowed"
                                dangerouslySetInnerHTML={{ __html: link.label }}
                            />
                        )
                    ))}
                </div>
            </div>
        </div>
    );
}