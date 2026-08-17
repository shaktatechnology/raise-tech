<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpsertTeamMemberRequest extends FormRequest
{
    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'position' => ['required', 'string', 'max:255'],
            'description' => ['required', 'string'],
            'is_active' => ['nullable', 'boolean'],
            /** Optional JPEG, PNG, or WebP profile photo replacement up to 10 MB. When supplied with remove_image, this replacement wins. */
            'image' => ['nullable', 'file', 'image', 'mimes:jpg,jpeg,png,webp', 'max:10240'],
            /** Mark the current saved profile photo for removal when no replacement is supplied. */
            'remove_image' => ['sometimes', 'boolean'],
        ];
    }
}
