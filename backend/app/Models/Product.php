<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Product extends Model
{
    use HasFactory;

    protected $fillable = [
        'title',
        'slug',
        'sku',
        'short_description',
        'description',
        'original_price',
        'discount_type',
        'discount_value',
        'stock_quantity',
        'sold_count',
        'featured_image',
        'is_active',
        'meta_title',
        'meta_description',
    ];

    protected function casts(): array
    {
        return [
            'original_price' => 'decimal:2',
            'discount_value' => 'decimal:2',
            'stock_quantity' => 'integer',
            'sold_count'     => 'integer',
            'is_active'      => 'boolean',
        ];
    }

    public function galleries(): HasMany
    {
        return $this->hasMany(ProductGallery::class, 'product_id');
    }
}
