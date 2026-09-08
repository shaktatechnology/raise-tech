<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Setting extends Model
{
    use HasFactory;

    protected $fillable = [
        'logo',
        'favicon',
        'short_description',
        'facebook_url',
        'twitter_url',
        'instagram_url',
        'linkedin_url',
        'tiktok_url',
        'whatsapp_url',
        'phone1',
        'phone2',
        'phone3',
        'email1',
        'email2',
        'inquiry_recipient_email',
        'is_inquiry_notification_enabled',
        'reply_to_email',
        'sender_name',
        'mail_mailer',
        'mail_host',
        'mail_port',
        'mail_username',
        'mail_password',
        'mail_encryption',
        'mail_from_address',
        'mail_from_name',
        'company_name',
        'contact_eyebrow',
        'contact_title',
        'contact_description',
        'operating_hours',
        'operating_hours_note',
        'location',
        'map_url',
        'is_cod_enabled',
        'is_standard_delivery_enabled',
        'is_express_delivery_enabled',
        'standard_delivery_charge',
        'express_delivery_charge',
        'payment_methods',
        'google_client_id',
        'google_client_secret',
        'is_google_login_enabled',
    ];

    protected $hidden = [
        'mail_password',
        'google_client_secret',
    ];

    protected $appends = [
        'has_mail_password',
        'has_google_client_secret',
    ];

    public function getHasMailPasswordAttribute(): bool
    {
        return !empty($this->mail_password);
    }

    public function getHasGoogleClientSecretAttribute(): bool
    {
        return !empty($this->google_client_secret);
    }

    protected function casts(): array
    {
        return [
            'mail_port' => 'integer',
            'is_cod_enabled' => 'boolean',
            'is_standard_delivery_enabled' => 'boolean',
            'is_express_delivery_enabled' => 'boolean',
            'is_inquiry_notification_enabled' => 'boolean',
            'is_google_login_enabled' => 'boolean',
            'standard_delivery_charge' => 'decimal:2',
            'express_delivery_charge' => 'decimal:2',
            'payment_methods' => 'array',
        ];
    }
}
