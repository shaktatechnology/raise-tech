<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Laravel\Prompts\Concerns\HasInfo;

class ServiceHeader extends Model
{
    use HasFactory;

    protected $fillable = [
        'title',
        'hero_image',
    ];
}
