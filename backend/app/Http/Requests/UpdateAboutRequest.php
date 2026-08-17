<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateAboutRequest extends FormRequest
{
    public function rules(): array
    {
        return [
            'about_description' => ['nullable', 'string'],
            'mission' => ['nullable', 'string'],
            'hero_image' => ['nullable', 'file', 'image', 'mimes:jpg,jpeg,png,webp', 'max:10240'],
            'about_image' => ['nullable', 'file', 'image', 'mimes:jpg,jpeg,png,webp', 'max:10240'],
            'what_we_do_image' => ['nullable', 'file', 'image', 'mimes:jpg,jpeg,png,webp', 'max:10240'],
            'remove_hero_image' => ['sometimes', 'boolean'],
            'remove_about_image' => ['sometimes', 'boolean'],
            'remove_what_we_do_image' => ['sometimes', 'boolean'],
        ];
    }
}
