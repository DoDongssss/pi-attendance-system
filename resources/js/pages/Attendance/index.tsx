import AppLayout from '@/layouts/app-layout';
import { SelectInput } from '@/components/SelectInput';
import StatusBadge from '@/components/StatusBadge';
import { useToast } from '@/components/Toast';
import { router } from '@inertiajs/react';
import { useState } from 'react';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Attendance', href: '/attendance' },
];

interface AttendanceLog {
    id: number;
    check_in: string | null;
    check_out: string | null;
    status: 'present' | 'absent' | 'late' | 'half_day';
    notes: string | null;
}

interface PIRow {
    id: number;
    code: string;
    name: string;
    is_expected: boolean;
    is_fallback: boolean;
    late_threshold: string;
    log: AttendanceLog | null;
}

interface HistoryRow {
    id: number;
    date: string;
    check_in: string | null;
    check_out: string | null;
    status: 'present' | 'absent' | 'late' | 'half_day';
    notes: string | null;
    pi: { id: number; name: string; code: string };
}

interface PaginatedHistory {
    data: HistoryRow[];
    current_page: number;
    last_page: number;
    next_page_url: string | null;
    prev_page_url: string | null;
    total: number;
}

interface PIOption {
    id: number;
    name: string;
    code: string;
}

interface Props {
    pis: PIRow[];
    history: PaginatedHistory;
    filters: Record<string, string>;
    today: string;
    piList: PIOption[];
}

const STATUS_OPTIONS = [
    { value: 'present',  label: 'Present'  },
    { value: 'absent',   label: 'Absent'   },
    { value: 'late',     label: 'Late'     },
    { value: 'half_day', label: 'Half Day' },
];

function formatTime(time: string | null): string {
    if (!time) return '—';
    const [h, m] = time.split(':');
    const hour   = parseInt(h);
    const suffix = hour >= 12 ? 'PM' : 'AM';
    const display = hour % 12 || 12;
    return `${display}:${m} ${suffix}`;
}

function formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString('en-PH', {
        year: 'numeric', month: 'short', day: 'numeric',
    });
}

export default function AttendanceIndex({ pis, history, filters, today, piList }: Props) {
    const { add } = useToast();
    const [loadingId, setLoadingId] = useState<number | null>(null);
    const [activeTab, setActiveTab] = useState<'dashboard' | 'history'>('dashboard');

    // History filters
    const [filterPi,     setFilterPi]     = useState(filters.pi_id    ?? '');
    const [filterStatus, setFilterStatus] = useState(filters.status   ?? '');
    const [filterFrom,   setFilterFrom]   = useState(filters.date_from ?? '');
    const [filterTo,     setFilterTo]     = useState(filters.date_to   ?? '');

    function handleCheckin(pi: PIRow) {
        setLoadingId(pi.id);
        router.post('/attendance/checkin', { pi_id: pi.id }, {
            preserveState: true,
            onSuccess: () => add(`${pi.name} checked in.`, 'success'),
            onError:   (e) => add(Object.values(e)[0] as string, 'error'),
            onFinish:  () => setLoadingId(null),
        });
    }

    function handleCheckout(pi: PIRow) {
        setLoadingId(pi.id);
        router.post('/attendance/checkout', { pi_id: pi.id }, {
            preserveState: true,
            onSuccess: () => add(`${pi.name} checked out.`, 'success'),
            onError:   (e) => add(Object.values(e)[0] as string, 'error'),
            onFinish:  () => setLoadingId(null),
        });
    }

    function handleHistoryFilter() {
        router.get('/attendance', {
            pi_id:     filterPi,
            status:    filterStatus,
            date_from: filterFrom,
            date_to:   filterTo,
        }, { preserveState: true });
    }

    function clearHistoryFilter() {
        setFilterPi(''); setFilterStatus('');
        setFilterFrom(''); setFilterTo('');
        router.get('/attendance', {}, { preserveState: true });
    }

    const piOptions = piList.map(p => ({
        value: String(p.id),
        label: `${p.code} — ${p.name}`,
    }));

    // Summary counts
    const checkedIn  = pis.filter(p => p.log?.check_in && !p.log?.check_out).length;
    const checkedOut = pis.filter(p => p.log?.check_out).length;
    const notYet     = pis.filter(p => !p.log && p.is_expected).length;

    return (
        <>
            <div className="p-6 space-y-5">

                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-xl font-semibold text-gray-900">Attendance</h1>
                        <p className="text-sm text-gray-400 mt-0.5">{formatDate(today)}</p>
                    </div>

                    {/* Tabs */}
                    <div className="flex rounded-lg border border-gray-200 overflow-hidden">
                        {(['dashboard', 'history'] as const).map(tab => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`px-4 py-2 text-sm font-medium capitalize transition ${
                                    activeTab === tab
                                        ? 'bg-gray-900 text-white'
                                        : 'bg-white text-gray-500 hover:bg-gray-50'
                                }`}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>
                </div>

                {/* ── DASHBOARD TAB ── */}
                {activeTab === 'dashboard' && (
                    <div className="space-y-4">

                        {/* Summary cards */}
                        <div className="grid grid-cols-3 gap-4">
                            {[
                                { label: 'Checked In',  value: checkedIn,  color: 'text-blue-600'  },
                                { label: 'Checked Out', value: checkedOut, color: 'text-green-600' },
                                { label: 'Not Yet',     value: notYet,     color: 'text-gray-400'  },
                            ].map(card => (
                                <div key={card.label} className="bg-white border border-gray-100 rounded-xl p-4 text-center">
                                    <p className={`text-2xl font-bold ${card.color}`}>{card.value}</p>
                                    <p className="text-xs text-gray-400 mt-1">{card.label}</p>
                                </div>
                            ))}
                        </div>

                        {/* PI Attendance Table */}
                        <div className="border border-gray-100 rounded-xl overflow-hidden">
                            <table className="w-full text-sm">
                                <thead className="bg-gray-50 border-b border-gray-100">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">PI</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">Check In</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">Check Out</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">Status</th>
                                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wide">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {pis.length === 0 && (
                                        <tr>
                                            <td colSpan={5} className="text-center py-12 text-gray-400 text-sm">
                                                No active PIs found.
                                            </td>
                                        </tr>
                                    )}
                                    {pis.map(pi => (
                                        <tr key={pi.id} className={`hover:bg-gray-50 transition-colors ${!pi.is_expected ? 'opacity-50' : ''}`}>
                                            <td className="px-4 py-3">
                                                <p className="font-medium text-gray-900">{pi.name}</p>
                                                <div className="flex items-center gap-2 mt-0.5">
                                                    <span className="font-mono text-xs text-gray-400">{pi.code}</span>
                                                    {pi.is_fallback && (
                                                        <span title="No schedule defined — using default weekdays"
                                                            className="text-yellow-400 text-xs">⚠</span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 text-gray-600 text-xs">
                                                {formatTime(pi.log?.check_in ?? null)}
                                            </td>
                                            <td className="px-4 py-3 text-gray-600 text-xs">
                                                {formatTime(pi.log?.check_out ?? null)}
                                            </td>
                                            <td className="px-4 py-3">
                                                {pi.log
                                                    ? <StatusBadge status={pi.log.status} />
                                                    : pi.is_expected
                                                        ? <span className="text-xs text-gray-400">Not yet</span>
                                                        : <span className="text-xs text-gray-300">Not scheduled</span>
                                                }
                                            </td>
                                            <td className="px-4 py-3 text-right">
                                                {!pi.log && pi.is_expected && (
                                                    <button
                                                        onClick={() => handleCheckin(pi)}
                                                        disabled={loadingId === pi.id}
                                                        className="px-3 py-1.5 text-xs font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                                                    >
                                                        {loadingId === pi.id ? '...' : 'Check In'}
                                                    </button>
                                                )}
                                                {pi.log?.check_in && !pi.log?.check_out && (
                                                    <button
                                                        onClick={() => handleCheckout(pi)}
                                                        disabled={loadingId === pi.id}
                                                        className="px-3 py-1.5 text-xs font-medium bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                                                    >
                                                        {loadingId === pi.id ? '...' : 'Check Out'}
                                                    </button>
                                                )}
                                                {pi.log?.check_out && (
                                                    <span className="text-xs text-gray-400">Done</span>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* ── HISTORY TAB ── */}
                {activeTab === 'history' && (
                    <div className="space-y-4">

                        {/* Filters */}
                        <div className="flex flex-wrap gap-3 items-end bg-gray-50 border border-gray-100 rounded-xl p-4">
                            <div className="w-52">
                                <SelectInput
                                    label="Person of Interest"
                                    value={filterPi}
                                    onChange={e => setFilterPi(e.target.value)}
                                    options={piOptions}
                                    placeholder="All PIs"
                                />
                            </div>
                            <div className="w-36">
                                <SelectInput
                                    label="Status"
                                    value={filterStatus}
                                    onChange={e => setFilterStatus(e.target.value)}
                                    options={STATUS_OPTIONS}
                                    placeholder="All statuses"
                                />
                            </div>
                            <div className="flex flex-col gap-1">
                                <label className="text-sm font-medium text-gray-700">From</label>
                                <input type="date" value={filterFrom}
                                    onChange={e => setFilterFrom(e.target.value)}
                                    className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                            </div>
                            <div className="flex flex-col gap-1">
                                <label className="text-sm font-medium text-gray-700">To</label>
                                <input type="date" value={filterTo}
                                    onChange={e => setFilterTo(e.target.value)}
                                    className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                            </div>
                            <button onClick={handleHistoryFilter}
                                className="bg-gray-800 text-white px-4 py-2 rounded-lg text-sm hover:bg-gray-900">
                                Filter
                            </button>
                            {(filterPi || filterStatus || filterFrom || filterTo) && (
                                <button onClick={clearHistoryFilter}
                                    className="text-sm text-gray-400 hover:text-gray-600 px-2 py-2">
                                    Clear
                                </button>
                            )}
                        </div>

                        {/* History table */}
                        <div className="border border-gray-100 rounded-xl overflow-hidden">
                            <table className="w-full text-sm">
                                <thead className="bg-gray-50 border-b border-gray-100">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">Date</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">PI</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">Check In</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">Check Out</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">Status</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">Notes</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {history.data.length === 0 && (
                                        <tr>
                                            <td colSpan={6} className="text-center py-12 text-gray-400 text-sm">
                                                No attendance records found.
                                            </td>
                                        </tr>
                                    )}
                                    {history.data.map(row => (
                                        <tr key={row.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-4 py-3 text-gray-600 text-xs whitespace-nowrap">
                                                {formatDate(row.date)}
                                            </td>
                                            <td className="px-4 py-3">
                                                <p className="font-medium text-gray-900">{row.pi.name}</p>
                                                <span className="font-mono text-xs text-gray-400">{row.pi.code}</span>
                                            </td>
                                            <td className="px-4 py-3 text-gray-600 text-xs">{formatTime(row.check_in)}</td>
                                            <td className="px-4 py-3 text-gray-600 text-xs">{formatTime(row.check_out)}</td>
                                            <td className="px-4 py-3"><StatusBadge status={row.status} /></td>
                                            <td className="px-4 py-3 text-gray-500 text-xs max-w-40 truncate">
                                                {row.notes ?? '—'}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        <div className="flex justify-between items-center text-sm text-gray-400">
                            <span>
                                Page {history.current_page} of {history.last_page} — {history.total} total records
                            </span>
                            <div className="flex gap-2">
                                {history.prev_page_url && (
                                    <button onClick={() => router.get(history.prev_page_url!)}
                                        className="px-3 py-1.5 border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-600 text-xs">
                                        ← Previous
                                    </button>
                                )}
                                {history.next_page_url && (
                                    <button onClick={() => router.get(history.next_page_url!)}
                                        className="px-3 py-1.5 border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-600 text-xs">
                                        Next →
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}