<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateScheduleRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('attendance.process');
    }

    protected function prepareForValidation(): void
    {
        if ($this->late_threshold && strlen($this->late_threshold) === 5) {
            $this->merge(['late_threshold' => $this->late_threshold . ':00']);
        }
    }

    public function rules(): array
    {
        return [
            'expected_days'   => ['required', 'array', 'min:1'],
            'expected_days.*' => ['required', 'date_format:Y-m-d'],
            'late_threshold'  => ['required', 'date_format:H:i:s'],
        ];
    }

    public function messages(): array
    {
        return [
            'expected_days.min'           => 'At least one expected day is required.',
            'expected_days.*.date_format' => 'Each expected day must be in YYYY-MM-DD format.',
        ];
    }
}