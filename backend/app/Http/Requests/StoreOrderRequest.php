<?php

namespace App\Http\Requests;

use Closure;
use Illuminate\Foundation\Http\FormRequest;

class StoreOrderRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'customer_name' => ['required', 'string', 'max:255'],
            'customer_email' => ['required', 'string', 'email:rfc', 'max:255'],
            'customer_phone' => ['nullable', 'string', 'max:30', $this->phoneNumberRule()],
            'delivery_type' => ['sometimes', 'string', 'in:standard'],
            'payment_method' => ['sometimes', 'string', 'in:cash_on_delivery'],
            'notes' => ['nullable', 'string', 'max:2000'],
            'items' => ['required', 'array', 'min:1'],
            'items.*' => ['required', 'array:product_id,quantity'],
            'items.*.product_id' => ['required', 'integer', 'distinct', 'exists:products,id'],
            'items.*.quantity' => ['required', 'integer', 'min:1'],

            'shipping_address' => ['required', 'array:name,address,city,province,phone_number'],
            'shipping_address.name' => ['required', 'string', 'max:255'],
            'shipping_address.address' => ['required', 'string', 'max:500'],
            'shipping_address.city' => ['required', 'string', 'max:100'],
            'shipping_address.province' => ['required', 'string', 'max:100'],
            'shipping_address.phone_number' => [
                'required',
                'string',
                'max:30',
                $this->phoneNumberRule(),
            ],

            'billing_same_as_shipping' => ['required', 'boolean'],
            'billing_address' => [
                'required_if:billing_same_as_shipping,false',
                'nullable',
                'array:name,address,city,province,phone_number',
            ],
            'billing_address.name' => [
                'required_if:billing_same_as_shipping,false',
                'string',
                'max:255',
            ],
            'billing_address.address' => [
                'required_if:billing_same_as_shipping,false',
                'string',
                'max:500',
            ],
            'billing_address.city' => [
                'required_if:billing_same_as_shipping,false',
                'string',
                'max:100',
            ],
            'billing_address.province' => [
                'required_if:billing_same_as_shipping,false',
                'string',
                'max:100',
            ],
            'billing_address.phone_number' => [
                'required_if:billing_same_as_shipping,false',
                'string',
                'max:30',
                $this->phoneNumberRule(),
            ],
        ];
    }

    private function phoneNumberRule(): Closure
    {
        return function (string $attribute, mixed $value, Closure $fail): void {
            if ($value === null) {
                return;
            }

            if (! is_string($value)
                || preg_match('/^\+?[0-9](?:[0-9\s().-]*[0-9])$/', $value) !== 1) {
                $fail("The {$attribute} field must be a valid phone number.");

                return;
            }

            $digitCount = strlen((string) preg_replace('/\D/', '', $value));

            if ($digitCount < 7 || $digitCount > 15) {
                $fail("The {$attribute} field must contain between 7 and 15 digits.");
            }
        };
    }
}
