import { router } from '@inertiajs/react';
import { useState } from 'react';
import { TextInput } from '@/components/TextInput';
import { SelectInput } from '@/components/SelectInput';
import PermissionGate from '@/components/PermissionGate';
import { useToast } from '@/components/Toast';
import { PI, PaginatedPIs, PIFilters, STATUS_OPTIONS } from './types';
import PIDetailPanel from './partials/PIDetailPanel';
import PIFormModal from './partials/PIFormModal';
import PIQRModal from './partials/PIQRModal';
import type { BreadcrumbItem } from '@/types';

export const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Persons of Interest', href: '/pi' },
];

interface Props {
    pis: PaginatedPIs;
    filters: PIFilters;
}

export default function PIIndex({ pis, filters }: Props) {
    const { add } = useToast();
    const [search, setSearch]       = useState(filters.search ?? '');
    const [status, setStatus]       = useState(filters.status ?? '');
    const [showModal, setShowModal] = useState(false);
    const [editingPI, setEditingPI] = useState<PI | undefined>(undefined);
    const [viewingPI, setViewingPI] = useState<PI | undefined>(undefined);
    const [qrPI, setQrPI]           = useState<PI | undefined>(undefined);

    function handleFilter() {
        router.get('/pi', { search, status }, { preserveState: true });
    }

    function handleDelete(pi: PI) {
        if (!confirm(`Archive "${pi.name}"?\nThis can be restored later.`)) return;
        router.delete(`/pi/${pi.id}`, {
            onSuccess: () => add('PI archived.', 'success'),
            onError:   () => add('Failed to archive PI.', 'error'),
        });
    }

    function handleRestore(pi: PI) {
        router.post(`/pi/${pi.id}/restore`, {}, {
            onSuccess: () => add('PI restored.', 'success'),
            onError:   () => add('Failed to restore PI.', 'error'),
        });
    }

    function openCreate() { setEditingPI(undefined); setShowModal(true); }
    function openEdit(pi: PI) { setViewingPI(undefined); setEditingPI(pi); setShowModal(true); }
    function openView(pi: PI) { setViewingPI(pi); }

    function formatDate(d: string | null) {
        if (!d) return '—';
        return new Date(d).toLocaleDateString('en-PH', { year: 'numeric', month: 'short', day: 'numeric' });
    }

    return (
        <>
            <div className="p-6 space-y-5">

                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-xl font-semibold text-gray-900">Persons of Interest</h1>
                        <p className="text-sm text-gray-400 mt-0.5">
                            {pis.data.length} record{pis.data.length !== 1 ? 's' : ''} on this page
                        </p>
                    </div>
                    <PermissionGate permission="pi.create">
                        <button onClick={openCreate}
                            className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 font-medium">
                            + Add PI
                        </button>
                    </PermissionGate>
                </div>

                {/* Filters */}
                <div className="flex flex-wrap gap-2 items-end bg-gray-50 border border-gray-100 rounded-xl p-4">
                    <div className="flex-1 min-w-48">
                        <TextInput placeholder="Search by name or code..." value={search}
                            onChange={e => setSearch(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && handleFilter()} />
                    </div>
                    <div className="w-44">
                        <SelectInput value={status} onChange={e => setStatus(e.target.value)}
                            placeholder="All statuses" options={STATUS_OPTIONS} />
                    </div>
                    <button onClick={handleFilter}
                        className="bg-gray-800 text-white px-4 py-2 rounded-lg text-sm hover:bg-gray-900">
                        Search
                    </button>
                    {(search || status) && (
                        <button onClick={() => { setSearch(''); setStatus(''); router.get('/pi', {}, { preserveState: true }); }}
                            className="text-sm text-gray-400 hover:text-gray-600 px-2 py-2">
                            Clear
                        </button>
                    )}
                </div>

                {/* Table */}
                <div className="border border-gray-100 rounded-xl overflow-hidden">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50 border-b border-gray-100">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">PI No.</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">Name / Alias</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">Date of Birth</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">Sex</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">Occupation</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">Status</th>
                                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wide">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {pis.data.length === 0 && (
                                <tr>
                                    <td colSpan={7} className="text-center py-12 text-gray-400 text-sm">
                                        No records found.
                                    </td>
                                </tr>
                            )}
                            {pis.data.map(pi => (
                                <tr key={pi.id} onClick={() => openView(pi)}
                                    className={`hover:bg-gray-50 transition-colors cursor-pointer ${pi.deleted_at ? 'opacity-40' : ''} ${viewingPI?.id === pi.id ? 'bg-blue-50' : ''}`}>
                                    <td className="px-4 py-3" onClick={e => e.stopPropagation()}>
                                        <span className="font-mono text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                                            {pi.code}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3">
                                        <p className="font-medium text-gray-900">{pi.name}</p>
                                        {pi.alias && <p className="text-xs text-gray-400 mt-0.5">"{pi.alias}"</p>}
                                    </td>
                                    <td className="px-4 py-3 text-gray-500 text-xs">{formatDate(pi.date_of_birth)}</td>
                                    <td className="px-4 py-3 text-gray-500 capitalize text-xs">{pi.sex ?? '—'}</td>
                                    <td className="px-4 py-3 text-gray-500 text-xs max-w-32 truncate">{pi.occupation ?? '—'}</td>
                                    <td className="px-4 py-3">
                                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                                            pi.deleted_at ? 'bg-orange-50 text-orange-600'
                                            : pi.status === 'active' ? 'bg-green-50 text-green-700'
                                            : 'bg-gray-100 text-gray-500'
                                        }`}>
                                            {pi.deleted_at ? 'Archived' : pi.status}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-right space-x-3" onClick={e => e.stopPropagation()}>
                                        {pi.deleted_at ? (
                                            <PermissionGate permission="pi.update">
                                                <button onClick={() => handleRestore(pi)}
                                                    className="text-blue-500 hover:text-blue-700 text-xs font-medium">
                                                    Restore
                                                </button>
                                            </PermissionGate>
                                        ) : (
                                            <>
                                                <PermissionGate permission="pi.view">
                                                    <button onClick={() => setQrPI(pi)}
                                                        className="text-gray-400 hover:text-gray-600 text-xs font-medium">
                                                        QR
                                                    </button>
                                                </PermissionGate>
                                                <PermissionGate permission="pi.update">
                                                    <button onClick={() => openEdit(pi)}
                                                        className="text-blue-500 hover:text-blue-700 text-xs font-medium">
                                                        Edit
                                                    </button>
                                                </PermissionGate>
                                                <PermissionGate permission="pi.delete">
                                                    <button onClick={() => handleDelete(pi)}
                                                        className="text-red-400 hover:text-red-600 text-xs font-medium">
                                                        Archive
                                                    </button>
                                                </PermissionGate>
                                            </>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="flex justify-between items-center text-sm text-gray-400">
                    <span>Page {pis.current_page} of {pis.last_page}</span>
                    <div className="flex gap-2">
                        {pis.prev_page_url && (
                            <button onClick={() => router.get(pis.prev_page_url!)}
                                className="px-3 py-1.5 border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-600 text-xs">
                                ← Previous
                            </button>
                        )}
                        {pis.next_page_url && (
                            <button onClick={() => router.get(pis.next_page_url!)}
                                className="px-3 py-1.5 border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-600 text-xs">
                                Next →
                            </button>
                        )}
                    </div>
                </div>
            </div>
            {qrPI && (
                <PIQRModal pi={qrPI} onClose={() => setQrPI(undefined)} />
            )}
            {viewingPI && (
                <PIDetailPanel pi={viewingPI} onClose={() => setViewingPI(undefined)} onEdit={() => openEdit(viewingPI)} />
            )}
            {showModal && (
                <PIFormModal pi={editingPI} onClose={() => setShowModal(false)} />
            )}
        </>
    );
}