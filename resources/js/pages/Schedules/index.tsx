// resources/js/pages/Schedules/Index.tsx
import AppLayout from '@/layouts/app-layout';
import { useToast } from '@/components/Toast';
import { router } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Schedules', href: '/schedules' },
];

interface PI {
    id: number;
    name: string;
    code: string;
}

interface Filters {
    pi_id: string | null;
    month: number;
    year: number;
}

interface Props {
    pis: PI[];
    scheduleDates: string[] | null;
    lateThreshold: string;
    scheduleId: number | null;
    isFallback: boolean;
    filters: Filters;
}

const MONTHS = [
    'January', 'February', 'March', 'April',
    'May', 'June', 'July', 'August',
    'September', 'October', 'November', 'December',
];

function getDaysInMonth(month: number, year: number): string[] {
    const days: string[] = [];
    const date = new Date(year, month - 1, 1);
    while (date.getMonth() === month - 1) {
        days.push(date.toISOString().split('T')[0]);
        date.setDate(date.getDate() + 1);
    }
    return days;
}

function isWeekend(dateStr: string): boolean {
    const day = new Date(dateStr).getDay();
    return day === 0 || day === 6;
}

function getDayName(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString('en-US', { weekday: 'short' });
}

export default function ScheduleIndex({
    pis,
    scheduleDates,
    lateThreshold,
    scheduleId,
    isFallback,
    filters,
}: Props) {
    const { add } = useToast();

    const [selectedPiId, setSelectedPiId] = useState(filters.pi_id ?? '');
    const [month, setMonth]               = useState(filters.month);
    const [year, setYear]                 = useState(filters.year);
    const [selectedDays, setSelectedDays] = useState<string[]>(scheduleDates ?? []);
    const [threshold, setThreshold]       = useState(lateThreshold ?? '08:00:00');
    const [saving, setSaving]             = useState(false);

    useEffect(() => {
        setSelectedDays(scheduleDates ?? []);
        setThreshold(lateThreshold ?? '08:00:00');
    }, [scheduleDates, lateThreshold]);

    const allDays = getDaysInMonth(month, year);
    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: 5 }, (_, i) => currentYear - 1 + i);

    function handleLoad() {
        if (!selectedPiId) {
            add('Please select a PI first.', 'warning');
            return;
        }
        router.get('/schedules', {
            pi_id: selectedPiId,
            month,
            year,
        }, { preserveState: true });
    }

    function toggleDay(date: string) {
        if (isWeekend(date)) return;
        setSelectedDays(prev =>
            prev.includes(date)
                ? prev.filter(d => d !== date)
                : [...prev, date]
        );
    }

    function handleSelectAllWeekdays() {
        setSelectedDays(allDays.filter(d => !isWeekend(d)));
    }

    function handleClear() {
        setSelectedDays([]);
    }

    function handleSave() {
        if (!selectedPiId) return;
        setSaving(true);

        const isUpdate = scheduleId !== null;
        const url      = isUpdate ? `/schedules/${scheduleId}` : '/schedules';

        if (isUpdate) {
            router.put(url, {
                pi_id:          Number(selectedPiId),
                month,
                year,
                expected_days:  selectedDays,
                late_threshold: threshold,
            }, {
                onSuccess: () => add('Schedule saved successfully.', 'success'),
                onError:   () => add('Failed to save schedule.', 'error'),
                onFinish:  () => setSaving(false),
            });
        } else {
            router.post(url, {
                pi_id:          Number(selectedPiId),
                month,
                year,
                expected_days:  selectedDays,
                late_threshold: threshold,
            }, {
                onSuccess: () => add('Schedule saved successfully.', 'success'),
                onError:   () => add('Failed to save schedule.', 'error'),
                onFinish:  () => setSaving(false),
            });
        }
    }

    // Calculate first day offset for calendar grid
    const firstDayOffset = new Date(allDays[0]).getDay();

    return (
        <>
            <div className="p-6 space-y-6 max-w-3xl">
                <h1 className="text-2xl font-semibold text-gray-800">
                    Schedule Management
                </h1>

                {/* Filters */}
                <div className="flex flex-wrap gap-3 items-end">
                    <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">
                            Person of Interest
                        </label>
                        <select
                            value={selectedPiId}
                            onChange={e => setSelectedPiId(e.target.value)}
                            className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="">Select a PI</option>
                            {pis.map(pi => (
                                <option key={pi.id} value={pi.id}>
                                    {pi.name} ({pi.code})
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">
                            Month
                        </label>
                        <select
                            value={month}
                            onChange={e => setMonth(Number(e.target.value))}
                            className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            {MONTHS.map((m, i) => (
                                <option key={i + 1} value={i + 1}>{m}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">
                            Year
                        </label>
                        <select
                            value={year}
                            onChange={e => setYear(Number(e.target.value))}
                            className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            {years.map(y => (
                                <option key={y} value={y}>{y}</option>
                            ))}
                        </select>
                    </div>

                    <button
                        onClick={handleLoad}
                        className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm hover:bg-blue-700"
                    >
                        Load Schedule
                    </button>
                </div>

                {/* Fallback warning */}
                {selectedPiId && isFallback && (
                    <div className="flex items-center gap-2 bg-yellow-50 border border-yellow-300 text-yellow-800 text-sm px-4 py-3 rounded-md">
                        <span>⚠</span>
                        <span>
                            No schedule defined for this PI — showing default weekdays.
                            Save to create a custom schedule.
                        </span>
                    </div>
                )}

                {/* Calendar */}
                {selectedPiId && scheduleDates !== null || (selectedPiId && isFallback) ? (
                    <div className="space-y-4">

                        {/* Quick actions */}
                        <div className="flex items-center gap-3 text-sm">
                            <button
                                onClick={handleSelectAllWeekdays}
                                className="text-blue-600 hover:underline"
                            >
                                Select All Weekdays
                            </button>
                            <span className="text-gray-300">|</span>
                            <button
                                onClick={handleClear}
                                className="text-gray-500 hover:underline"
                            >
                                Clear All
                            </button>
                            <span className="ml-auto text-gray-500">
                                {selectedDays.length} day{selectedDays.length !== 1 ? 's' : ''} selected
                            </span>
                        </div>

                        {/* Day headers */}
                        <div className="grid grid-cols-7 gap-1">
                            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                                <div key={d} className="text-center text-xs font-semibold text-gray-400 py-2">
                                    {d}
                                </div>
                            ))}

                            {/* Empty offset cells */}
                            {Array.from({ length: firstDayOffset }).map((_, i) => (
                                <div key={`empty-${i}`} />
                            ))}

                            {/* Day cells */}
                            {allDays.map(date => {
                                const weekend  = isWeekend(date);
                                const selected = selectedDays.includes(date);
                                const day      = new Date(date).getDate();

                                return (
                                    <button
                                        key={date}
                                        onClick={() => toggleDay(date)}
                                        disabled={weekend}
                                        title={getDayName(date)}
                                        className={`
                                            rounded-md py-2 text-sm font-medium transition-colors
                                            ${weekend
                                                ? 'bg-gray-50 text-gray-300 cursor-not-allowed'
                                                : selected
                                                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                                                    : 'bg-white border border-gray-200 text-gray-700 hover:border-blue-400 hover:text-blue-600'
                                            }
                                        `}
                                    >
                                        {day}
                                    </button>
                                );
                            })}
                        </div>

                        {/* Late threshold */}
                        <div className="flex items-center gap-3 pt-2">
                            <label className="text-sm font-medium text-gray-600">
                                Late Threshold
                            </label>
                            <input
                                type="time"
                                value={threshold.slice(0, 5)}
                                onChange={e => setThreshold(e.target.value + ':00')}
                                className="border border-gray-300 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <span className="text-xs text-gray-400">
                                Check-ins after this time are marked as late
                            </span>
                        </div>

                        {/* Save */}
                        <div className="pt-2">
                            <button
                                onClick={handleSave}
                                disabled={saving || selectedDays.length === 0}
                                className="bg-green-600 text-white px-6 py-2 rounded-md text-sm hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {saving ? 'Saving...' : scheduleId ? 'Update Schedule' : 'Save Schedule'}
                            </button>
                        </div>
                    </div>
                ) : (
                    !selectedPiId && (
                        <p className="text-gray-400 text-sm">
                            Select a PI and a month to manage their schedule.
                        </p>
                    )
                )}
            </div>
        </>
    );
}