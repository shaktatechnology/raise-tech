<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Testimonial extends Model
{
    use HasFactory;

    protected $fillable = [
        'rating',
        'name',
        'role',
        'company_name',
        'description',
    ];

    protected function casts(): array
    {
        return [
            'rating' => 'integer',
        ];
    }
}
