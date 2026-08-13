<?php

namespace App\Models;

use Database\Factories\BillingAddressFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class BillingAddress extends Model
{
    /** @use HasFactory<BillingAddressFactory> */
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
