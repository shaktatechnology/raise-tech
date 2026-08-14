<?php

namespace App\Models;

use Database\Factories\WhyChooseUsFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class WhyChooseUs extends Model
{
    /** @use HasFactory<WhyChooseUsFactory> */
    use HasFactory;

    protected $table = 'why_choose_us_items';

    protected $fillable = [
        'title',
        'description',
    ];

    protected $appends = [
        'name',
    ];

    /**
     * Preserve the response shape expected by the existing admin and public UI.
     */
    public function getNameAttribute(): string
    {
        return (string) $this->attributes['title'];
    }
}
