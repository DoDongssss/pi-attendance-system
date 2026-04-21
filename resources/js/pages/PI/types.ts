export interface PI {
    id: number;
    code: string;
    name: string;
    alias: string | null;
    identifying_marks: string | null;
    date_of_birth: string | null;
    sex: 'male' | 'female' | 'other' | null;
    civil_status: 'single' | 'married' | 'separated' | 'widowed' | 'annulled' | null;
    spouse_name: string | null;
    no_of_dependents: number | null;
    address: string | null;
    educational_attainment: string | null;
    occupation: string | null;
    monthly_income: string | null;
    hobbies: string | null;
    skills: string | null;
    religious_affiliation: string | null;
    sibling_rank: number | null;
    sibling_male_count: number | null;
    sibling_female_count: number | null;
    status: 'active' | 'inactive';
    notes: string | null;
    start_date: string | null;
    end_date: string | null;  
    deleted_at: string | null;
}

export interface PaginatedPIs {
    data: PI[];
    current_page: number;
    last_page: number;
    next_page_url: string | null;
    prev_page_url: string | null;
}

export interface PIFilters {
    search?: string;
    status?: string;
}

export type PIFormData = {
    code: string;
    name: string;
    alias: string;
    identifying_marks: string;
    date_of_birth: string;
    sex: string;
    civil_status: string;
    spouse_name: string;
    no_of_dependents: string;
    address: string;
    educational_attainment: string;
    occupation: string;
    monthly_income: string;
    hobbies: string;
    skills: string;
    religious_affiliation: string;
    sibling_rank: string;
    sibling_male_count: string;
    sibling_female_count: string;
    status: string;
    notes: string;
    start_date: string; 
    end_date: string;   
};

export type FormTab = 'personal' | 'background' | 'family' | 'system';

export const FORM_TABS: { key: FormTab; label: string }[] = [
    { key: 'personal',   label: 'Personal Info' },
    { key: 'background', label: 'Background'    },
    { key: 'family',     label: 'Family'        },
    { key: 'system',     label: 'System'        },
];

export const STATUS_OPTIONS = [
    { value: 'active',   label: 'Active'   },
    { value: 'inactive', label: 'Inactive' },
];

export const SEX_OPTIONS = [
    { value: 'male',   label: 'Male'   },
    { value: 'female', label: 'Female' },
    { value: 'other',  label: 'Other'  },
];

export const CIVIL_STATUS_OPTIONS = [
    { value: 'single',    label: 'Single'    },
    { value: 'married',   label: 'Married'   },
    { value: 'separated', label: 'Separated' },
    { value: 'widowed',   label: 'Widowed'   },
    { value: 'annulled',  label: 'Annulled'  },
];