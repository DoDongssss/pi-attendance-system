import PermissionGate from '@/components/PermissionGate';
import { PI } from '../types';

interface Props {
    pi: PI;
    onClose: () => void;
    onEdit: () => void;
}

function DetailRow({ label, value }: { label: string; value: React.ReactNode }) {
    return (
        <div className="flex flex-col gap-0.5">
            <span className="text-xs text-gray-400 uppercase tracking-wide font-medium">{label}</span>
            <span className="text-sm text-gray-800">{value ?? <span className="text-gray-300">—</span>}</span>
        </div>
    );
}

function SectionHeading({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex items-center gap-3 mt-6 mb-3">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-widest whitespace-nowrap">
                {children}
            </span>
            <div className="flex-1 border-t border-gray-100" />
        </div>
    );
}

export default function PIDetailPanel({ pi, onClose, onEdit }: Props) {
    function formatDate(d: string | null) {
        if (!d) return null;
        return new Date(d).toLocaleDateString('en-PH', { year: 'numeric', month: 'long', day: 'numeric' });
    }

    function computeAge(dob: string | null): string | null {
        if (!dob) return null;
        const diff = Date.now() - new Date(dob).getTime();
        return `${Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25))} years old`;
    }

    function capitalize(s: string | null) {
        if (!s) return null;
        return s.charAt(0).toUpperCase() + s.slice(1);
    }

    function formatIncome(v: string | null) {
        if (!v) return null;
        return new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(Number(v));
    }

    return (
        <>
            <div className="fixed inset-0 bg-black/30 z-40" onClick={onClose} />

            <div className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-white shadow-2xl flex flex-col">

                {/* Header */}
                <div className="px-6 py-5 border-b border-gray-100 flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
                            <span className="text-sm font-semibold text-blue-600">
                                {pi.name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase()}
                            </span>
                        </div>
                        <div>
                            <h2 className="text-base font-semibold text-gray-900 leading-tight">{pi.name}</h2>
                            <div className="flex items-center gap-2 mt-0.5">
                                <span className="font-mono text-xs text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">
                                    {pi.code}
                                </span>
                                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                                    pi.deleted_at
                                        ? 'bg-orange-50 text-orange-600'
                                        : pi.status === 'active'
                                            ? 'bg-green-50 text-green-700'
                                            : 'bg-gray-100 text-gray-500'
                                }`}>
                                    {pi.deleted_at ? 'Archived' : pi.status}
                                </span>
                            </div>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-gray-300 hover:text-gray-500 mt-1 text-lg leading-none shrink-0">✕</button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto px-6 py-4">
                    <SectionHeading>Personal Information</SectionHeading>
                    <div className="grid grid-cols-2 gap-4">
                        <DetailRow label="Alias" value={pi.alias ? `"${pi.alias}"` : null} />
                        <DetailRow label="Date of Birth" value={
                            pi.date_of_birth
                                ? <>{formatDate(pi.date_of_birth)}<br /><span className="text-xs text-gray-400">{computeAge(pi.date_of_birth)}</span></>
                                : null
                        } />
                        <DetailRow label="Sex" value={capitalize(pi.sex)} />
                        <DetailRow label="Civil Status" value={capitalize(pi.civil_status)} />
                    </div>
                    <div className="mt-4">
                        <DetailRow label="Address" value={pi.address} />
                    </div>
                    {pi.identifying_marks && (
                        <div className="mt-4 p-3 bg-amber-50 border border-amber-100 rounded-lg">
                            <p className="text-xs font-medium text-amber-700 mb-1 uppercase tracking-wide">Identifying Marks</p>
                            <p className="text-sm text-amber-900">{pi.identifying_marks}</p>
                        </div>
                    )}

                    <SectionHeading>Background</SectionHeading>
                    <div className="grid grid-cols-2 gap-4">
                        <DetailRow label="Education" value={pi.educational_attainment} />
                        <DetailRow label="Occupation" value={pi.occupation} />
                        <DetailRow label="Monthly Income" value={formatIncome(pi.monthly_income)} />
                        <DetailRow label="Religion" value={pi.religious_affiliation} />
                        <DetailRow label="Hobbies" value={pi.hobbies} />
                        <DetailRow label="Skills" value={pi.skills} />
                    </div>

                    <SectionHeading>Family</SectionHeading>
                    <div className="grid grid-cols-2 gap-4">
                        <DetailRow label="Spouse's Name" value={pi.spouse_name} />
                        <DetailRow label="No. of Dependents" value={pi.no_of_dependents} />
                        <DetailRow label="Sibling Info" value={
                            pi.sibling_rank != null
                                ? `Rank ${pi.sibling_rank} of ${(pi.sibling_male_count ?? 0) + (pi.sibling_female_count ?? 0)} siblings (${pi.sibling_male_count ?? 0}M / ${pi.sibling_female_count ?? 0}F)`
                                : null
                        } />
                    </div>

                    <SectionHeading>Timeline</SectionHeading>
                    <div className="grid grid-cols-2 gap-4">
                        <DetailRow label="Start Date" value={formatDate(pi.start_date)} />
                        <DetailRow label="End Date"   value={pi.end_date ? formatDate(pi.end_date) : 'Ongoing'} />
                    </div>

                    {pi.notes && (
                        <>
                            <SectionHeading>Notes</SectionHeading>
                            <p className="text-sm text-gray-600 leading-relaxed bg-gray-50 rounded-lg p-3 border border-gray-100">
                                {pi.notes}
                            </p>
                        </>
                    )}
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex justify-end gap-2">
                    <button onClick={onClose}
                        className="px-4 py-2 text-sm rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-100">
                        Close
                    </button>
                    {!pi.deleted_at && (
                        <PermissionGate permission="pi.update">
                            <button onClick={onEdit}
                                className="px-5 py-2 text-sm rounded-lg bg-blue-600 text-white hover:bg-blue-700 font-medium">
                                Edit
                            </button>
                        </PermissionGate>
                    )}
                </div>
            </div>
        </>
    );
}