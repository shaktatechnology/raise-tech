<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class About extends Model
{
    /** @use HasFactory<\Database\Factories\AboutFactory> */
    use HasFactory;

    protected $fillable = [
        'hero_image',
        'about_description',
        'about_image',
        'what_we_do_image',
        'why_choose_us_image',
        'mission',
    ];
}
