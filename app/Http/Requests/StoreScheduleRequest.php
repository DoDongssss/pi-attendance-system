<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use App\Models\PersonOfInterest;
use Illuminate\Validation\Validator;

class StoreScheduleRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('attendance.process');
    }

    protected function prepareForValidation(): void
    {
        // Ensure late_threshold is always H:i:s
        if ($this->late_threshold && strlen($this->late_threshold) === 5) {
            $this->merge(['late_threshold' => $this->late_threshold . ':00']);
        }

        // Cast to integers so validation and DB inserts are type-safe
        $this->merge([
            'pi_id' => (int) $this->pi_id,
            'month' => (int) $this->month,
            'year'  => (int) $this->year,
        ]);
    }

    public function withValidator(Validator $validator): void
    {
        $validator->after(function (Validator $validator) {
            $pi = PersonOfInterest::find($this->pi_id);
            if (!$pi) return;

            $scheduleStart = \Carbon\Carbon::createFromDate($this->year, $this->month, 1);
            $scheduleEnd   = $scheduleStart->copy()->endOfMonth();

            if ($pi->start_date && $scheduleEnd->lt(\Carbon\Carbon::parse($pi->start_date))) {
                $validator->errors()->add('month', 'Schedule is before this PI\'s start date.');
            }

            if ($pi->end_date && $scheduleStart->gt(\Carbon\Carbon::parse($pi->end_date))) {
                $validator->errors()->add('month', 'Schedule is after this PI\'s end date.');
            }
        });
    }

    public function rules(): array
    {
        return [
            'pi_id' => [
                'required', 'integer', 'exists:persons_of_interest,id',
                Rule::unique('schedules')
                    ->where(fn($q) => $q
                        ->where('month', $this->month)
                        ->where('year',  $this->year)
                    ),
            ],
            'month'           => ['required', 'integer', 'min:1', 'max:12'],
            'year'            => ['required', 'integer', 'min:2020', 'max:2100'],
            'expected_days'   => ['required', 'array', 'min:1'],
            'expected_days.*' => ['required', 'date_format:Y-m-d'],
            'late_threshold'  => ['required', 'date_format:H:i:s'],
        ];
    }

    public function messages(): array
    {
        return [
            'pi_id.unique'                => 'A schedule for this PI already exists for the selected month and year.',
            'expected_days.min'           => 'At least one expected day is required.',
            'expected_days.*.date_format' => 'Each expected day must be in YYYY-MM-DD format.',
        ];
    }
}