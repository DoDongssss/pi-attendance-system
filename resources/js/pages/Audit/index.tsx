import AppLayout from '@/layouts/app-layout';
import { SelectInput } from '@/components/SelectInput';
import { router } from '@inertiajs/react';
import { useState } from 'react';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Audit Log', href: '/audit' },
];

interface ActivityLog {
    id: number;
    log_name: string;
    description: string;
    subject_type: string | null;
    subject_id: number | null;
    causer: { id: number; name: string } | null;
    properties: Record<string, unknown>;
    created_at: string;
}

interface PaginatedLogs {
    data: ActivityLog[];
    current_page: number;
    last_page: number;
    next_page_url: string | null;
    prev_page_url: string | null;
    total: number;
}

interface UserOption {
    id: number;
    name: string;
}

interface Props {
    logs: PaginatedLogs;
    users: UserOption[];
    filters: Record<string, string>;
}

const LOG_NAME_OPTIONS = [
    { value: 'pi',          label: 'PI Management' },
    { value: 'attendance',  label: 'Attendance'    },
    { value: 'processing',  label: 'Processing'    },
    { value: 'users',       label: 'Users'         },
];

const LOG_COLORS: Record<string, string> = {
    pi:         'bg-blue-50 text-blue-700',
    attendance: 'bg-green-50 text-green-700',
    processing: 'bg-red-50 text-red-700',
    users:      'bg-purple-50 text-purple-700',
};

function formatDateTime(dateStr: string): string {
    return new Date(dateStr).toLocaleString('en-PH', {
        year:   'numeric',
        month:  'short',
        day:    'numeric',
        hour:   '2-digit',
        minute: '2-digit',
    });
}

function getSubjectLabel(log: ActivityLog): string {
    if (!log.subject_type) return '—';
    const parts = log.subject_type.split('\\');
    const model = parts[parts.length - 1];
    return log.subject_id ? `${model} #${log.subject_id}` : model;
}

function PropertiesCell({ properties }: { properties: Record<string, unknown> }) {
    const attrs = properties?.attributes as Record<string, unknown> | undefined;
    const old   = properties?.old       as Record<string, unknown> | undefined;

    if (!attrs && !properties) return <span className="text-gray-300">—</span>;

    const data = attrs ?? properties;

    return (
        <div className="space-y-1">
            {Object.entries(data).slice(0, 3).map(([key, val]) => (
                <div key={key} className="flex items-center gap-1 text-xs">
                    <span className="text-gray-400 font-mono">{key}:</span>
                    {old?.[key] !== undefined && old[key] !== val ? (
                        <span className="flex items-center gap-1">
                            <span className="text-red-400 line-through">{String(old[key])}</span>
                            <span className="text-gray-400">→</span>
                            <span className="text-green-600">{String(val)}</span>
                        </span>
                    ) : (
                        <span className="text-gray-600">{String(val)}</span>
                    )}
                </div>
            ))}
            {Object.keys(data).length > 3 && (
                <p className="text-xs text-gray-300">
                    +{Object.keys(data).length - 3} more
                </p>
            )}
        </div>
    );
}

export default function AuditIndex({ logs, users, filters }: Props) {
    const [logName,   setLogName]   = useState(filters.log_name   ?? '');
    const [causerId,  setCauserId]  = useState(filters.causer_id  ?? '');
    const [dateFrom,  setDateFrom]  = useState(filters.date_from  ?? '');
    const [dateTo,    setDateTo]    = useState(filters.date_to    ?? '');

    const userOptions = users.map(u => ({
        value: String(u.id),
        label: u.name,
    }));

    function handleFilter() {
        router.get('/audit', {
            log_name:  logName,
            causer_id: causerId,
            date_from: dateFrom,
            date_to:   dateTo,
        }, { preserveState: true });
    }

    function clearFilter() {
        setLogName(''); setCauserId('');
        setDateFrom(''); setDateTo('');
        router.get('/audit', {}, { preserveState: true });
    }

    const hasFilters = logName || causerId || dateFrom || dateTo;

    return (
        <>
            <div className="p-6 space-y-6">

                {/* Header */}
                <div>
                    <h1 className="text-xl font-semibold text-gray-900">Audit Log</h1>
                    <p className="text-sm text-gray-400 mt-0.5">
                        Complete history of all system actions
                    </p>
                </div>

                {/* Filters */}
                <div className="flex flex-wrap gap-3 items-end bg-gray-50 border border-gray-100 rounded-xl p-4">
                    <div className="w-44">
                        <SelectInput
                            label="Log Type"
                            value={logName}
                            onChange={e => setLogName(e.target.value)}
                            options={LOG_NAME_OPTIONS}
                            placeholder="All types"
                        />
                    </div>
                    <div className="w-44">
                        <SelectInput
                            label="Performed By"
                            value={causerId}
                            onChange={e => setCauserId(e.target.value)}
                            options={userOptions}
                            placeholder="All users"
                        />
                    </div>
                    <div className="flex flex-col gap-1">
                        <label className="text-sm font-medium text-gray-700">From</label>
                        <input
                            type="date"
                            value={dateFrom}
                            onChange={e => setDateFrom(e.target.value)}
                            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <div className="flex flex-col gap-1">
                        <label className="text-sm font-medium text-gray-700">To</label>
                        <input
                            type="date"
                            value={dateTo}
                            onChange={e => setDateTo(e.target.value)}
                            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <button
                        onClick={handleFilter}
                        className="bg-gray-800 text-white px-4 py-2 rounded-lg text-sm hover:bg-gray-900"
                    >
                        Filter
                    </button>
                    {hasFilters && (
                        <button
                            onClick={clearFilter}
                            className="text-sm text-gray-400 hover:text-gray-600 px-2 py-2"
                        >
                            Clear
                        </button>
                    )}
                </div>

                {/* Stats bar */}
                <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span>{logs.total} total log entries</span>
                    <span>·</span>
                    <span>Page {logs.current_page} of {logs.last_page}</span>
                </div>

                {/* Log table */}
                <div className="border border-gray-100 rounded-xl overflow-hidden">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50 border-b border-gray-100">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">
                                    Timestamp
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">
                                    Type
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">
                                    Action
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">
                                    Subject
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">
                                    Performed By
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">
                                    Changes
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {logs.data.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="text-center py-12 text-gray-400 text-sm">
                                        No audit logs found.
                                    </td>
                                </tr>
                            )}
                            {logs.data.map(log => (
                                <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-4 py-3 text-xs text-gray-500 whitespace-nowrap">
                                        {formatDateTime(log.created_at)}
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${LOG_COLORS[log.log_name] ?? 'bg-gray-100 text-gray-600'}`}>
                                            {log.log_name}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-xs text-gray-700 max-w-48">
                                        {log.description}
                                    </td>
                                    <td className="px-4 py-3 text-xs text-gray-500 font-mono">
                                        {getSubjectLabel(log)}
                                    </td>
                                    <td className="px-4 py-3 text-xs text-gray-700">
                                        {log.causer?.name ?? (
                                            <span className="text-gray-300">System</span>
                                        )}
                                    </td>
                                    <td className="px-4 py-3 max-w-64">
                                        <PropertiesCell properties={log.properties as Record<string, unknown>} />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="flex justify-between items-center text-sm text-gray-400">
                    <span>
                        Showing {logs.data.length} of {logs.total} entries
                    </span>
                    <div className="flex gap-2">
                        {logs.prev_page_url && (
                            <button
                                onClick={() => router.get(logs.prev_page_url!)}
                                className="px-3 py-1.5 border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-600 text-xs"
                            >
                                ← Previous
                            </button>
                        )}
                        {logs.next_page_url && (
                            <button
                                onClick={() => router.get(logs.next_page_url!)}
                                className="px-3 py-1.5 border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-600 text-xs"
                            >
                                Next →
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}