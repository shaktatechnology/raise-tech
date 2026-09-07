<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateHomeTestimonialImageRequest extends FormRequest
{
    public function rules(): array
    {
        return [
            'image' => ['nullable', 'file', 'image', 'mimes:jpg,jpeg,png,webp', 'max:10240'],
            'remove_image' => ['sometimes', 'boolean'],
        ];
    }
}
