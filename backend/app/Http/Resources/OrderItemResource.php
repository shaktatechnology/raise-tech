<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class OrderItemResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'product_id' => $this->product_id,
            'product_title' => $this->product_title,
            'product_sku' => $this->product_sku,
            'unit_price' => $this->unit_price,
            'quantity' => $this->quantity,
            'subtotal' => $this->subtotal,
        ];
    }
}
