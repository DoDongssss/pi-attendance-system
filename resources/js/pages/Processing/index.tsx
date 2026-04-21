import AppLayout from '@/layouts/app-layout';
import StatusBadge from '@/components/StatusBadge';
import ConfirmDialog from '@/components/ConfirmDialog';
import { useToast } from '@/components/Toast';
import { router } from '@inertiajs/react';
import { useState } from 'react';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Absence Processing', href: '/attendance/process' },
];

interface PIRow {
    id: number;
    code: string;
    name: string;
}

interface ProcessedRow {
    id: number;
    pi: { id: number; name: string; code: string };
    status: 'absent';
    processed_by: string | null;
    notes: string | null;
}

interface Props {
    unprocessed: PIRow[];
    processed: ProcessedRow[];
    selectedDate: string;
}

function formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString('en-PH', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
    });
}

export default function ProcessingIndex({ unprocessed, processed, selectedDate }: Props) {
    const { add }                         = useToast();
    const [date, setDate]                 = useState(selectedDate);
    const [selected, setSelected]         = useState<number[]>([]);
    const [notes, setNotes]               = useState('');
    const [processing, setProcessing]     = useState(false);
    const [showConfirm, setShowConfirm]   = useState(false);

    function handleDateChange(newDate: string) {
        setDate(newDate);
        setSelected([]);
        router.get('/attendance/process', { date: newDate }, { preserveState: false });
    }

    function toggleSelect(id: number) {
        setSelected(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    }

    function toggleAll() {
        setSelected(prev =>
            prev.length === unprocessed.length
                ? []
                : unprocessed.map(p => p.id)
        );
    }

    function handleProcess() {
        if (selected.length === 0) {
            add('Select at least one PI to process.', 'error');
            return;
        }
        setShowConfirm(true);
    }

    function confirmProcess() {
        setShowConfirm(false);
        setProcessing(true);

        router.post('/attendance/process', {
            pi_ids: selected,
            date,
            notes,
        }, {
            onSuccess: () => {
                add(`${selected.length} absence${selected.length > 1 ? 's' : ''} processed.`, 'success');
                setSelected([]);
                setNotes('');
            },
            onError: () => add('Failed to process absences.', 'error'),
            onFinish: () => setProcessing(false),
        });
    }

    const allSelected = selected.length === unprocessed.length && unprocessed.length > 0;

    return (
        <>
            <div className="p-6 space-y-6">

                {/* Header */}
                <div className="flex items-start justify-between">
                    <div>
                        <h1 className="text-xl font-semibold text-gray-900">Absence Processing</h1>
                        <p className="text-sm text-gray-400 mt-0.5">
                            Manually mark unprocessed PIs as absent for a given date
                        </p>
                    </div>

                    {/* Date selector */}
                    <div className="flex flex-col gap-1">
                        <label className="text-xs font-medium text-gray-500">Select Date</label>
                        <input
                            type="date"
                            value={date}
                            onChange={e => handleDateChange(e.target.value)}
                            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                </div>

                {/* Selected date display */}
                <div className="bg-blue-50 border border-blue-100 rounded-xl px-4 py-3">
                    <p className="text-sm font-medium text-blue-700">{formatDate(date)}</p>
                    <p className="text-xs text-blue-500 mt-0.5">
                        {unprocessed.length} unprocessed · {processed.length} already marked absent
                    </p>
                </div>

                {/* Unprocessed PIs */}
                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <h2 className="text-sm font-semibold text-gray-700">
                            Unprocessed PIs
                        </h2>
                        {unprocessed.length > 0 && (
                            <button
                                onClick={toggleAll}
                                className="text-xs text-blue-600 hover:text-blue-800"
                            >
                                {allSelected ? 'Deselect All' : 'Select All'}
                            </button>
                        )}
                    </div>

                    {unprocessed.length === 0 ? (
                        <div className="border border-dashed border-gray-200 rounded-xl py-12 text-center text-gray-400">
                            <p className="text-sm">All PIs have been processed for this date. ✓</p>
                        </div>
                    ) : (
                        <div className="border border-gray-100 rounded-xl overflow-hidden">
                            <table className="w-full text-sm">
                                <thead className="bg-gray-50 border-b border-gray-100">
                                    <tr>
                                        <th className="px-4 py-3 w-10">
                                            <input
                                                type="checkbox"
                                                checked={allSelected}
                                                onChange={toggleAll}
                                                className="rounded border-gray-300"
                                            />
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">
                                            PI No.
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">
                                            Name
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {unprocessed.map(pi => (
                                        <tr
                                            key={pi.id}
                                            onClick={() => toggleSelect(pi.id)}
                                            className={`cursor-pointer transition-colors hover:bg-gray-50 ${
                                                selected.includes(pi.id) ? 'bg-blue-50' : ''
                                            }`}
                                        >
                                            <td className="px-4 py-3" onClick={e => e.stopPropagation()}>
                                                <input
                                                    type="checkbox"
                                                    checked={selected.includes(pi.id)}
                                                    onChange={() => toggleSelect(pi.id)}
                                                    className="rounded border-gray-300"
                                                />
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className="font-mono text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                                                    {pi.code}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 font-medium text-gray-900">
                                                {pi.name}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* Notes + Process button */}
                    {unprocessed.length > 0 && (
                        <div className="flex items-end gap-3 pt-1">
                            <div className="flex-1">
                                <label className="text-sm font-medium text-gray-700 block mb-1">
                                    Notes <span className="text-gray-400 font-normal">(optional)</span>
                                </label>
                                <input
                                    type="text"
                                    value={notes}
                                    onChange={e => setNotes(e.target.value)}
                                    placeholder="e.g. Holiday, weather disruption..."
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <button
                                onClick={handleProcess}
                                disabled={selected.length === 0 || processing}
                                className="px-5 py-2 text-sm font-medium rounded-lg bg-red-600 text-white hover:bg-red-700 disabled:opacity-50 whitespace-nowrap"
                            >
                                {processing
                                    ? 'Processing...'
                                    : `Mark ${selected.length > 0 ? selected.length : ''} Absent`}
                            </button>
                        </div>
                    )}
                </div>

                {/* Already processed */}
                {processed.length > 0 && (
                    <div className="space-y-3">
                        <h2 className="text-sm font-semibold text-gray-700">
                            Already Processed
                        </h2>
                        <div className="border border-gray-100 rounded-xl overflow-hidden">
                            <table className="w-full text-sm">
                                <thead className="bg-gray-50 border-b border-gray-100">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">PI</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">Status</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">Processed By</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">Notes</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {processed.map(row => (
                                        <tr key={row.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-4 py-3">
                                                <p className="font-medium text-gray-900">{row.pi.name}</p>
                                                <span className="font-mono text-xs text-gray-400">{row.pi.code}</span>
                                            </td>
                                            <td className="px-4 py-3">
                                                <StatusBadge status={row.status} />
                                            </td>
                                            <td className="px-4 py-3 text-xs text-gray-500">
                                                {row.processed_by ?? '—'}
                                            </td>
                                            <td className="px-4 py-3 text-xs text-gray-500 max-w-40 truncate">
                                                {row.notes ?? '—'}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>

            {/* Confirm Dialog */}
            <ConfirmDialog
                open={showConfirm}
                title="Process Absences"
                message={`Mark ${selected.length} PI${selected.length > 1 ? 's' : ''} as absent for ${formatDate(date)}? This action will be logged.`}
                confirmLabel="Yes, Mark Absent"
                cancelLabel="Cancel"
                danger
                onConfirm={confirmProcess}
                onCancel={() => setShowConfirm(false)}
            />
        </>
    );
}