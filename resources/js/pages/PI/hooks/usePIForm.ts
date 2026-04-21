import { useForm } from '@inertiajs/react';
import { useToast } from '@/components/Toast';
import { PI, PIFormData, FormTab } from '../types';

export function usePIForm(pi?: PI, onClose?: () => void) {
    const { add } = useToast();

    const { data, setData, post, put, processing, errors, reset } = useForm<PIFormData>({
        code:                    pi?.code                             ?? '',
        name:                    pi?.name                             ?? '',
        alias:                   pi?.alias                            ?? '',
        identifying_marks:       pi?.identifying_marks                ?? '',
        date_of_birth:           pi?.date_of_birth                    ?? '',
        sex:                     pi?.sex                              ?? '',
        civil_status:            pi?.civil_status                     ?? '',
        spouse_name:             pi?.spouse_name                      ?? '',
        no_of_dependents:        pi?.no_of_dependents?.toString()     ?? '',
        address:                 pi?.address                          ?? '',
        educational_attainment:  pi?.educational_attainment           ?? '',
        occupation:              pi?.occupation                       ?? '',
        monthly_income:          pi?.monthly_income                   ?? '',
        hobbies:                 pi?.hobbies                          ?? '',
        skills:                  pi?.skills                           ?? '',
        religious_affiliation:   pi?.religious_affiliation            ?? '',
        sibling_rank:            pi?.sibling_rank?.toString()         ?? '',
        sibling_male_count:      pi?.sibling_male_count?.toString()   ?? '',
        sibling_female_count:    pi?.sibling_female_count?.toString() ?? '',
        status:                  pi?.status                           ?? 'active',
        notes:                   pi?.notes                            ?? '',
        start_date:              pi?.start_date                       ?? '',
        end_date:                pi?.end_date                         ?? '',
    });

    function handleSubmit() {
        if (pi) {
            put(`/pi/${pi.id}`, {
                onSuccess: () => { add('PI updated successfully.', 'success'); onClose?.(); },
                onError:   () => add('Please check the form for errors.', 'error'),
            });
        } else {
            post('/pi', {
                onSuccess: () => { add('PI created successfully.', 'success'); reset(); onClose?.(); },
                onError:   () => add('Please check the form for errors.', 'error'),
            });
        }
    }

    function tabHasErrors(tab: FormTab): boolean {
        const tabFields: Record<FormTab, (keyof PIFormData)[]> = {
            personal:   ['code', 'name', 'alias', 'identifying_marks', 'date_of_birth', 'sex', 'civil_status', 'address'],
            background: ['educational_attainment', 'occupation', 'monthly_income', 'hobbies', 'skills', 'religious_affiliation'],
            family:     ['spouse_name', 'no_of_dependents', 'sibling_rank', 'sibling_male_count', 'sibling_female_count'],
            system:     ['status', 'notes', 'start_date', 'end_date'],
        };
        return tabFields[tab].some(f => !!errors[f]);
    }

    return { data, setData, processing, errors, handleSubmit, tabHasErrors };
}