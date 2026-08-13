<?php

namespace App\Models;

use Database\Factories\ShippingAddressFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ShippingAddress extends Model
{
    /** @use HasFactory<ShippingAddressFactory> */
    use HasFactory;

    protected $fillable = [
        'name',
        'address',
        'city',
        'province',
        'phone_number',
    ];

    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }
}
