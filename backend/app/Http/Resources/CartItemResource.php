<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CartItemResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'product_id' => $this->product_id,
            'product_title' => $this->product?->title,
            'product_slug' => $this->product?->slug,
            'product_sku' => $this->product?->sku,
            'featured_image' => $this->product?->featured_image,
            'unit_price' => number_format($this->unit_price, 2, '.', ''),
            'quantity' => $this->quantity,
            'subtotal' => number_format($this->subtotal, 2, '.', ''),
            'available_stock' => $this->product?->stock_quantity ?? 0,
            'is_active' => (bool) ($this->product?->is_active ?? false),
        ];
    }
}
