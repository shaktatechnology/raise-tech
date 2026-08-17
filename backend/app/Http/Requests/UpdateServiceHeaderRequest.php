<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateServiceHeaderRequest extends FormRequest
{
    public function rules(): array
    {
        return [
            'title' => ['nullable', 'string', 'max:255'],
            /** Optional JPEG, PNG, or WebP hero replacement up to 10 MB. When supplied with remove_hero_image, this replacement wins. */
            'hero_image' => ['nullable', 'file', 'image', 'mimes:jpg,jpeg,png,webp', 'max:10240'],
            /** Mark the current saved hero for removal when no replacement image is supplied. */
            'remove_hero_image' => ['sometimes', 'boolean'],
        ];
    }
}
