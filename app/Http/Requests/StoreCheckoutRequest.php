<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreCheckoutRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('attendance.checkout');
    }

    public function rules(): array
    {
        return [
            'pi_id' => ['required', 'integer', 'exists:persons_of_interest,id'],
            'notes' => ['nullable', 'string', 'max:500'],
        ];
    }
}