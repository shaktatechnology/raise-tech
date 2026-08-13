<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CartItem extends Model
{
    use HasFactory;

    protected $fillable = [
        'cart_id',
        'product_id',
        'quantity',
    ];

    protected function casts(): array
    {
        return [
            'quantity' => 'integer',
        ];
    }

    public function cart(): BelongsTo
    {
        return $this->belongsTo(Cart::class);
    }

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    public function getUnitPriceAttribute(): float
    {
        if (! $this->relationLoaded('product') || $this->product === null) {
            return 0.0;
        }

        $price = (float) $this->product->original_price;
        $discountValue = (float) $this->product->discount_value;

        if ($this->product->discount_type === 'percentage' && $discountValue > 0) {
            return round(max(0, $price - ($price * $discountValue / 100)), 2);
        }

        if ($this->product->discount_type === 'fixed' && $discountValue > 0) {
            return round(max(0, $price - $discountValue), 2);
        }

        return round($price, 2);
    }

    public function getSubtotalAttribute(): float
    {
        return round($this->unit_price * $this->quantity, 2);
    }
}
