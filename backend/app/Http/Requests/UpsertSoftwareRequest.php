<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpsertSoftwareRequest extends FormRequest
{
    public function rules(): array
    {
        return [
            'software_section_id' => ['nullable', 'exists:software_sections,id'],
            'title' => ['required', 'string', 'max:255'],
            'slogan' => ['nullable', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            /** Optional JPEG, PNG, or WebP product image replacement up to 10 MB. When supplied with remove_image, this replacement wins. */
            'image' => ['nullable', 'file', 'image', 'mimes:jpg,jpeg,png,webp', 'max:10240'],
            /** Mark the current saved product image for removal when no replacement image is supplied. */
            'remove_image' => ['sometimes', 'boolean'],
            'is_active' => ['nullable', 'boolean'],
        ];
    }
}
