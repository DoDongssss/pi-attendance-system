import { useState } from 'react';
import { FORM_TABS, FormTab, PI } from '../types';
import { usePIForm } from '../hooks/usePIForm';
import PIFormFields from './PIFormFields';

interface Props {
    pi?: PI;
    onClose: () => void;
}

export default function PIFormModal({ pi, onClose }: Props) {
    const [activeTab, setActiveTab] = useState<FormTab>('personal');
    const { data, setData, processing, errors, handleSubmit, tabHasErrors } = usePIForm(pi, onClose);

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl flex flex-col max-h-[90vh]">

                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                    <div>
                        <h2 className="text-base font-semibold text-gray-900">
                            {pi ? 'Edit Person of Interest' : 'Add Person of Interest'}
                        </h2>
                        {pi && <p className="text-xs text-gray-400 mt-0.5">{pi.code}</p>}
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-lg leading-none">✕</button>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-gray-100 px-6 gap-1">
                    {FORM_TABS.map(tab => (
                        <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                            className={`relative px-3 py-3 text-sm font-medium transition-colors ${
                                activeTab === tab.key
                                    ? 'text-blue-600 border-b-2 border-blue-600 -mb-px'
                                    : 'text-gray-500 hover:text-gray-700'
                            }`}>
                            {tab.label}
                            {tabHasErrors(tab.key) && (
                                <span className="absolute top-2 right-1 w-1.5 h-1.5 rounded-full bg-red-500" />
                            )}
                        </button>
                    ))}
                </div>

                {/* Body */}
                <div className="overflow-y-auto flex-1 px-6 py-5">
                    <PIFormFields
                        activeTab={activeTab}
                        data={data}
                        errors={errors}
                        setData={setData}
                    />
                </div>

                {/* Footer */}
                <div className="flex justify-between items-center px-6 py-4 border-t border-gray-100 bg-gray-50 rounded-b-xl">
                    <div className="flex gap-1">
                        {FORM_TABS.map(tab => (
                            <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                                className={`w-2 h-2 rounded-full transition-colors ${
                                    activeTab === tab.key ? 'bg-blue-600' : 'bg-gray-300'
                                }`} />
                        ))}
                    </div>
                    <div className="flex gap-2">
                        <button onClick={onClose}
                            className="px-4 py-2 text-sm rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-100">
                            Cancel
                        </button>
                        <button onClick={handleSubmit} disabled={processing}
                            className="px-5 py-2 text-sm rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 font-medium">
                            {processing ? 'Saving...' : pi ? 'Save Changes' : 'Add PI'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}