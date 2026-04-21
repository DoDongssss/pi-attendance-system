<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StorePIRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('pi.create');
    }

    public function rules(): array
    {
        return [
            'code'                   => ['required', 'string', 'max:50', 'unique:persons_of_interest,code'],
            'name'                   => ['required', 'string', 'max:255'],
            'alias'                  => ['nullable', 'string', 'max:255'],
            'identifying_marks'      => ['nullable', 'string'],
            'date_of_birth'          => ['nullable', 'date'],
            'sex'                    => ['nullable', 'in:male,female,other'],
            'civil_status'           => ['nullable', 'in:single,married,separated,widowed,annulled'],
            'spouse_name'            => ['nullable', 'string', 'max:255'],
            'no_of_dependents'       => ['nullable', 'integer', 'min:0'],
            'address'                => ['nullable', 'string'],
            'educational_attainment' => ['nullable', 'string', 'max:255'],
            'occupation'             => ['nullable', 'string', 'max:255'],
            'monthly_income'         => ['nullable', 'numeric', 'min:0'],
            'hobbies'                => ['nullable', 'string', 'max:255'],
            'skills'                 => ['nullable', 'string', 'max:255'],
            'religious_affiliation'  => ['nullable', 'string', 'max:255'],
            'sibling_rank'           => ['nullable', 'integer', 'min:1'],
            'sibling_male_count'     => ['nullable', 'integer', 'min:0'],
            'sibling_female_count'   => ['nullable', 'integer', 'min:0'],
            'status'                 => ['required', 'in:active,inactive'],
            'notes'                  => ['nullable', 'string'],
            'start_date'             => ['nullable', 'date'],
            'end_date'               => ['nullable', 'date', 'after_or_equal:start_date'],
        ];
    }
}