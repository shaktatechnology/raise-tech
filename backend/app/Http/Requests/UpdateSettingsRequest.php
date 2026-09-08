<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateSettingsRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->isAdmin() ?? false;
    }

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
            'phone3' => ['nullable', 'string', 'max:25'],
            'email1' => ['nullable', 'email', 'max:255'],
            'email2' => ['nullable', 'email', 'max:255'],
            'inquiry_recipient_email' => ['nullable', 'email', 'max:255'],
            'is_inquiry_notification_enabled' => ['sometimes', 'boolean'],
            'reply_to_email' => ['nullable', 'email', 'max:255'],
            'sender_name' => ['nullable', 'string', 'max:255'],
            'mail_mailer' => ['nullable', 'string', 'max:50'],
            'mail_host' => ['nullable', 'string', 'max:255'],
            'mail_port' => ['nullable', 'integer', 'min:1', 'max:65535'],
            'mail_username' => ['nullable', 'string', 'max:255'],
            'mail_password' => ['nullable', 'string', 'max:500'],
            'remove_mail_password' => ['sometimes', 'boolean'],
            'mail_encryption' => ['nullable', 'string', 'max:50'],
            'mail_from_address' => ['nullable', 'email', 'max:255'],
            'mail_from_name' => ['nullable', 'string', 'max:255'],
            'google_client_id' => ['nullable', 'string', 'max:500'],
            'google_client_secret' => ['nullable', 'string', 'max:500'],
            'is_google_login_enabled' => ['sometimes', 'boolean'],
            'remove_google_client_secret' => ['sometimes', 'boolean'],
            'company_name' => ['nullable', 'string', 'max:255'],
            'contact_eyebrow' => ['nullable', 'string', 'max:255'],
            'contact_title' => ['nullable', 'string', 'max:255'],
            'contact_description' => ['nullable', 'string', 'max:2000'],
            'operating_hours' => ['nullable', 'string', 'max:255'],
            'operating_hours_note' => ['nullable', 'string', 'max:255'],
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
