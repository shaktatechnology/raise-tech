<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Setting extends Model
{
    use HasFactory;

    protected $fillable = [
        'short_description',
        'facebook_url',
        'twitter_url',
        'instagram_url',
        'linkedin_url',
        'tiktok_url',
        'whatsapp_url',
        'phone1',
        'phone2',
        'email1',
        'email2',
        'location',
        'map_url',
        'is_cod_enabled',
        'payment_methods',
    ];  

    protected function casts(): array
    {
        return[
            'is_cod_enabled' => 'boolean',
            'payment_methods' => 'array',
        ];
    }
}
