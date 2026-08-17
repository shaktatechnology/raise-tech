<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateBannerRequest extends FormRequest
{
    public function rules(): array
    {
        return [
            'title' => ['nullable', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            /** Optional JPEG, PNG, or WebP replacement up to 10 MB. When supplied with remove_image, this replacement wins. */
            'image' => ['nullable', 'file', 'image', 'mimes:jpg,jpeg,png,webp', 'max:10240'],
            /** Mark the current saved image for removal when no replacement image is supplied. */
            'remove_image' => ['sometimes', 'boolean'],
        ];
    }
}
