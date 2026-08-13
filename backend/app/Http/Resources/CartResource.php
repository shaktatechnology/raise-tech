<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CartResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'total_items' => $this->items->count(),
            'total_quantity' => $this->total_quantity,
            'subtotal' => number_format($this->subtotal, 2, '.', ''),
            'items' => CartItemResource::collection($this->whenLoaded('items')),
            'updated_at' => $this->updated_at?->toISOString(),
        ];
    }
}
