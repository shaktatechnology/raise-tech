<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PortfolioHeader extends Model
{
    use HasFactory;

    protected $fillable = [
        'title',
        'hero_image',
    ];
}
