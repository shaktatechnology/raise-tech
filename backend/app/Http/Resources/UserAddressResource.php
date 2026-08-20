<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UserAddressResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'type' => $this->type,
            'label' => $this->label,
            'name' => $this->name,
            'phone_number' => $this->phone_number,
            'address' => $this->address,
            'city' => $this->city,
            'province' => $this->province,
            'is_default' => $this->is_default,
        ];
    }
}
