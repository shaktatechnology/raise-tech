<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Software extends Model
{
    use HasFactory;

    protected $table = 'software';

    protected $fillable = [
        'software_section_id',
        'title',
        'slogan',
        'description',
        'image',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
        ];
    }

    public function section()
    {
        return $this->belongsTo(SoftwareSection::class, 'software_section_id');
    }
}
