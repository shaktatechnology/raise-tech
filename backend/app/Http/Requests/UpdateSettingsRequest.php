<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateSettingsRequest extends FormRequest
{
    public function rules(): array
    {
        return [
            'short_description' => ['nullable', 'string'],
            'facebook_url' => ['nullable', 'url'],
            'twitter_url' => ['nullable', 'url'],
            'instagram_url' => ['nullable', 'url'],
            'linkedin_url' => ['nullable', 'url'],
            'tiktok_url' => ['nullable', 'url'],
            'whatsapp_url' => ['nullable', 'url'],
            'phone1' => ['nullable', 'string', 'max:25'],
            'phone2' => ['nullable', 'string', 'max:25'],
            'email1' => ['nullable', 'email', 'max:255'],
            'email2' => ['nullable', 'email', 'max:255'],
            'location' => ['nullable', 'string', 'max:500'],
            'map_url' => ['nullable', 'url'],
            'is_cod_enabled' => ['sometimes', 'boolean'],
            'is_standard_delivery_enabled' => ['sometimes', 'boolean'],
            'is_express_delivery_enabled' => ['sometimes', 'boolean'],
            'standard_delivery_charge' => ['nullable', 'numeric', 'min:0'],
            'express_delivery_charge' => ['nullable', 'numeric', 'min:0'],
            'logo' => ['nullable', 'file', 'image', 'mimes:jpg,jpeg,png,webp', 'max:10240'],
            'favicon' => ['nullable', 'file', 'image', 'mimes:ico,jpg,jpeg,png,webp', 'max:10240'],
            'remove_logo' => ['sometimes', 'boolean'],
            'remove_favicon' => ['sometimes', 'boolean'],
        ];
    }
}
