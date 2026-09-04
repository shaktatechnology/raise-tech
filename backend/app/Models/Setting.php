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
        'location',
        'map_url',
        'is_cod_enabled',
        'is_standard_delivery_enabled',
        'is_express_delivery_enabled',
        'standard_delivery_charge',
        'express_delivery_charge',
        'payment_methods',
    ];  

    protected function casts(): array
    {
        return [
            'is_cod_enabled' => 'boolean',
            'is_standard_delivery_enabled' => 'boolean',
            'is_express_delivery_enabled' => 'boolean',
            'standard_delivery_charge' => 'decimal:2',
            'express_delivery_charge' => 'decimal:2',
            'payment_methods' => 'array',
        ];
    }
}
