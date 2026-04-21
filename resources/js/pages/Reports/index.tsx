import AppLayout from '@/layouts/app-layout';
import { SelectInput } from '@/components/SelectInput';
import { router } from '@inertiajs/react';
import { useState } from 'react';
import { usePermission } from '@/hooks/usePermission';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Reports', href: '/reports' },
];

interface SummaryRow {
    pi_id: number;
    pi_name: string;
    pi_code: string;
    present_count: number;
    absent_count: number;
    late_count: number;
    half_day_count: number;
    total_days: number;
}

interface PaginatedSummary {
    data: SummaryRow[];
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
    summary: PaginatedSummary;
    filters: { month: number; year: number; pi_id?: number };
    piList: PIOption[];
}

const MONTHS = [
    { value: '1',  label: 'January'   }, { value: '2',  label: 'February'  },
    { value: '3',  label: 'March'     }, { value: '4',  label: 'April'     },
    { value: '5',  label: 'May'       }, { value: '6',  label: 'June'      },
    { value: '7',  label: 'July'      }, { value: '8',  label: 'August'    },
    { value: '9',  label: 'September' }, { value: '10', label: 'October'   },
    { value: '11', label: 'November'  }, { value: '12', label: 'December'  },
];

function generateYears() {
    const current = new Date().getFullYear();
    return Array.from({ length: 6 }, (_, i) => ({
        value: String(current - 1 + i),
        label: String(current - 1 + i),
    }));
}

function AttendanceBar({ value, total, color }: { value: number; total: number; color: string }) {
    const pct = total > 0 ? Math.round((value / total) * 100) : 0;
    return (
        <div className="flex items-center gap-2">
            <div className="flex-1 bg-gray-100 rounded-full h-1.5">
                <div
                    className={`h-1.5 rounded-full ${color}`}
                    style={{ width: `${pct}%` }}
                />
            </div>
            <span className="text-xs text-gray-500 w-6 text-right">{value}</span>
        </div>
    );
}

export default function ReportsIndex({ summary, filters, piList }: Props) {
    const canExport = usePermission('report.export');

    const [month, setMonth] = useState(String(filters.month));
    const [year,  setYear]  = useState(String(filters.year));
    const [piId,  setPiId]  = useState(String(filters.pi_id ?? ''));

    const piOptions = piList.map(p => ({
        value: String(p.id),
        label: `${p.code} — ${p.name}`,
    }));

    function handleFilter() {
        router.get('/reports', { month, year, pi_id: piId }, { preserveState: true });
    }

    function handleExport() {
        const params = new URLSearchParams({ month, year });
        if (piId) params.append('pi_id', piId);
        window.location.href = `/reports/export?${params.toString()}`;
    }

    // Totals across current page
    const totals = summary.data.reduce(
        (acc, row) => ({
            present:  acc.present  + row.present_count,
            absent:   acc.absent   + row.absent_count,
            late:     acc.late     + row.late_count,
            half_day: acc.half_day + row.half_day_count,
            total:    acc.total    + row.total_days,
        }),
        { present: 0, absent: 0, late: 0, half_day: 0, total: 0 }
    );

    const monthLabel = MONTHS.find(m => m.value === month)?.label ?? '';

    return (
        <>
            <div className="p-6 space-y-6">

                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-xl font-semibold text-gray-900">Reports</h1>
                        <p className="text-sm text-gray-400 mt-0.5">
                            Attendance summary by PI
                        </p>
                    </div>
                    {canExport && (
                        <button
                            onClick={handleExport}
                            className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-gray-800 text-white rounded-lg hover:bg-gray-900"
                        >
                            ↓ Export CSV
                        </button>
                    )}
                </div>

                {/* Filters */}
                <div className="flex flex-wrap gap-3 items-end bg-gray-50 border border-gray-100 rounded-xl p-4">
                    <div className="w-36">
                        <SelectInput
                            label="Month"
                            value={month}
                            onChange={e => setMonth(e.target.value)}
                            options={MONTHS}
                        />
                    </div>
                    <div className="w-28">
                        <SelectInput
                            label="Year"
                            value={year}
                            onChange={e => setYear(e.target.value)}
                            options={generateYears()}
                        />
                    </div>
                    <div className="w-56">
                        <SelectInput
                            label="Person of Interest"
                            value={piId}
                            onChange={e => setPiId(e.target.value)}
                            options={piOptions}
                            placeholder="All PIs"
                        />
                    </div>
                    <button
                        onClick={handleFilter}
                        className="bg-gray-800 text-white px-4 py-2 rounded-lg text-sm hover:bg-gray-900"
                    >
                        Filter
                    </button>
                    {(piId) && (
                        <button
                            onClick={() => { setPiId(''); router.get('/reports', { month, year }, { preserveState: true }); }}
                            className="text-sm text-gray-400 hover:text-gray-600 px-2 py-2"
                        >
                            Clear
                        </button>
                    )}
                </div>

                {/* Summary cards */}
                <div className="grid grid-cols-4 gap-4">
                    {[
                        { label: 'Present',  value: totals.present,  color: 'text-green-600',  bg: 'bg-green-50'  },
                        { label: 'Absent',   value: totals.absent,   color: 'text-red-600',    bg: 'bg-red-50'    },
                        { label: 'Late',     value: totals.late,     color: 'text-yellow-600', bg: 'bg-yellow-50' },
                        { label: 'Half Day', value: totals.half_day, color: 'text-blue-600',   bg: 'bg-blue-50'   },
                    ].map(card => (
                        <div key={card.label} className={`${card.bg} border border-gray-100 rounded-xl p-4 text-center`}>
                            <p className={`text-2xl font-bold ${card.color}`}>{card.value}</p>
                            <p className="text-xs text-gray-500 mt-1">{card.label}</p>
                        </div>
                    ))}
                </div>

                {/* Report table */}
                <div className="space-y-2">
                    <h2 className="text-sm font-semibold text-gray-700">
                        {monthLabel} {year} — {summary.total} PI{summary.total !== 1 ? 's' : ''}
                    </h2>

                    <div className="border border-gray-100 rounded-xl overflow-hidden">
                        <table className="w-full text-sm">
                            <thead className="bg-gray-50 border-b border-gray-100">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">PI</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide w-32">Present</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide w-32">Absent</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide w-32">Late</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide w-32">Half Day</th>
                                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wide">Total</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {summary.data.length === 0 && (
                                    <tr>
                                        <td colSpan={6} className="text-center py-12 text-gray-400 text-sm">
                                            No records found for this period.
                                        </td>
                                    </tr>
                                )}
                                {summary.data.map(row => (
                                    <tr key={row.pi_id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-4 py-3">
                                            <p className="font-medium text-gray-900">{row.pi_name}</p>
                                            <span className="font-mono text-xs text-gray-400">{row.pi_code}</span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <AttendanceBar value={row.present_count}  total={row.total_days} color="bg-green-500"  />
                                        </td>
                                        <td className="px-4 py-3">
                                            <AttendanceBar value={row.absent_count}   total={row.total_days} color="bg-red-400"    />
                                        </td>
                                        <td className="px-4 py-3">
                                            <AttendanceBar value={row.late_count}     total={row.total_days} color="bg-yellow-400" />
                                        </td>
                                        <td className="px-4 py-3">
                                            <AttendanceBar value={row.half_day_count} total={row.total_days} color="bg-blue-400"   />
                                        </td>
                                        <td className="px-4 py-3 text-center text-xs font-medium text-gray-600">
                                            {row.total_days}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    <div className="flex justify-between items-center text-sm text-gray-400 pt-1">
                        <span>
                            Page {summary.current_page} of {summary.last_page} — {summary.total} total
                        </span>
                        <div className="flex gap-2">
                            {summary.prev_page_url && (
                                <button
                                    onClick={() => router.get(summary.prev_page_url!)}
                                    className="px-3 py-1.5 border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-600 text-xs"
                                >
                                    ← Previous
                                </button>
                            )}
                            {summary.next_page_url && (
                                <button
                                    onClick={() => router.get(summary.next_page_url!)}
                                    className="px-3 py-1.5 border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-600 text-xs"
                                >
                                    Next →
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}