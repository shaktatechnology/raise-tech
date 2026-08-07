<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class WhatWeDo extends Model
{
    /** @use HasFactory<\Database\Factories\WhatWeDoFactory> */
    use HasFactory;

    protected $table = 'what_we_do_items';

    protected $fillable = [
        'title',
        'description',
    ];
}
