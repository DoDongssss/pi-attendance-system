import { TextInput } from '@/components/TextInput';
import { SelectInput } from '@/components/SelectInput';
import { FormTab, PIFormData, SEX_OPTIONS, CIVIL_STATUS_OPTIONS, STATUS_OPTIONS } from '../types';

interface Props {
    activeTab: FormTab;
    data: PIFormData;
    errors: Partial<Record<keyof PIFormData, string>>;
    setData: (field: keyof PIFormData, value: string) => void;
}

export default function PIFormFields({ activeTab, data, errors, setData }: Props) {
    if (activeTab === 'personal') return (
        <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
                <TextInput label="PI Number" placeholder="PI-2025-000001" value={data.code}
                    onChange={e => setData('code', e.target.value)} error={errors.code} />
                <TextInput label="Full Name" placeholder="Last, First Middle" value={data.name}
                    onChange={e => setData('name', e.target.value)} error={errors.name} />
            </div>
            <div className="grid grid-cols-2 gap-4">
                <TextInput label="Alias(es)" placeholder="Known aliases or nicknames" value={data.alias}
                    onChange={e => setData('alias', e.target.value)} error={errors.alias} />
                <TextInput label="Date of Birth" type="date" value={data.date_of_birth}
                    onChange={e => setData('date_of_birth', e.target.value)} error={errors.date_of_birth} />
            </div>
            <div className="grid grid-cols-2 gap-4">
                <SelectInput label="Sex" value={data.sex} placeholder="Select sex"
                    onChange={e => setData('sex', e.target.value)} options={SEX_OPTIONS} error={errors.sex} />
                <SelectInput label="Civil Status" value={data.civil_status} placeholder="Select status"
                    onChange={e => setData('civil_status', e.target.value)} options={CIVIL_STATUS_OPTIONS} error={errors.civil_status} />
            </div>
            <TextInput label="Address" placeholder="Complete address" value={data.address}
                onChange={e => setData('address', e.target.value)} error={errors.address} />
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Identifying Marks</label>
                <textarea rows={3} placeholder="Tattoos, scars, birthmarks..."
                    value={data.identifying_marks}
                    onChange={e => setData('identifying_marks', e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
                {errors.identifying_marks && <p className="text-xs text-red-500 mt-1">{errors.identifying_marks}</p>}
            </div>
        </div>
    );

    if (activeTab === 'background') return (
        <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
                <TextInput label="Educational Attainment" placeholder="e.g. Computer Engineering"
                    value={data.educational_attainment}
                    onChange={e => setData('educational_attainment', e.target.value)}
                    error={errors.educational_attainment} />
                <TextInput label="Occupation" placeholder="e.g. System Integrator"
                    value={data.occupation} onChange={e => setData('occupation', e.target.value)}
                    error={errors.occupation} />
            </div>
            <div className="grid grid-cols-2 gap-4">
                <TextInput label="Monthly Income" type="number" placeholder="0.00"
                    value={data.monthly_income} onChange={e => setData('monthly_income', e.target.value)}
                    error={errors.monthly_income} />
                <TextInput label="Religious Affiliation" placeholder="e.g. Roman Catholic"
                    value={data.religious_affiliation}
                    onChange={e => setData('religious_affiliation', e.target.value)}
                    error={errors.religious_affiliation} />
            </div>
            <TextInput label="Hobbies" placeholder="e.g. Reading, Basketball"
                value={data.hobbies} onChange={e => setData('hobbies', e.target.value)} error={errors.hobbies} />
            <TextInput label="Skills" placeholder="e.g. Welding, Programming"
                value={data.skills} onChange={e => setData('skills', e.target.value)} error={errors.skills} />
        </div>
    );

    if (activeTab === 'family') return (
        <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
                <TextInput label="Spouse's Name" placeholder="Full name of spouse"
                    value={data.spouse_name} onChange={e => setData('spouse_name', e.target.value)}
                    error={errors.spouse_name} />
                <TextInput label="No. of Dependents" type="number" placeholder="0"
                    value={data.no_of_dependents} onChange={e => setData('no_of_dependents', e.target.value)}
                    error={errors.no_of_dependents} />
            </div>
            <div className="border border-gray-100 rounded-lg p-4 space-y-4">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Sibling Information</p>
                <div className="grid grid-cols-3 gap-4">
                    <TextInput label="Sibling Rank" type="number" placeholder="e.g. 2"
                        value={data.sibling_rank} onChange={e => setData('sibling_rank', e.target.value)}
                        error={errors.sibling_rank} />
                    <TextInput label="No. of Brothers" type="number" placeholder="0"
                        value={data.sibling_male_count} onChange={e => setData('sibling_male_count', e.target.value)}
                        error={errors.sibling_male_count} />
                    <TextInput label="No. of Sisters" type="number" placeholder="0"
                        value={data.sibling_female_count} onChange={e => setData('sibling_female_count', e.target.value)}
                        error={errors.sibling_female_count} />
                </div>
            </div>
        </div>
    );

    // system tab
    return (
        <div className="space-y-4">
            <SelectInput label="Status" value={data.status}
                onChange={e => setData('status', e.target.value as 'active' | 'inactive')}
                options={STATUS_OPTIONS} error={errors.status} />

            {/* ← new */}
            <div className="grid grid-cols-2 gap-4">
                <TextInput
                    label="Start Date"
                    type="date"
                    value={data.start_date}
                    onChange={e => setData('start_date', e.target.value)}
                    error={errors.start_date}
                />
                <TextInput
                    label="End Date (optional)"
                    type="date"
                    value={data.end_date}
                    onChange={e => setData('end_date', e.target.value)}
                    error={errors.end_date}
                />
            </div>
            {data.start_date && data.end_date && data.end_date < data.start_date && (
                <p className="text-xs text-red-500">End date must be after start date.</p>
            )}

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <textarea rows={5} placeholder="Additional notes or remarks..."
                    value={data.notes} onChange={e => setData('notes', e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
                {errors.notes && <p className="text-xs text-red-500 mt-1">{errors.notes}</p>}
            </div>
        </div>
    );
}