<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreProductRequest extends FormRequest
{
    public function rules(): array
    {
        return [
            'title' => ['required', 'string', 'max:255'],
            'slug' => ['nullable', 'string', 'max:255', 'unique:products,slug'],
            'sku' => ['nullable', 'string', 'max:100', 'unique:products,sku'],
            'short_description' => ['nullable', 'string'],
            'description' => ['nullable', 'string'],
            'original_price' => ['required', 'numeric', 'min:0'],
            'discount_type' => ['nullable', 'in:percentage,fixed'],
            'discount_value' => ['nullable', 'numeric', 'min:0'],
            'stock_quantity' => ['nullable', 'integer', 'min:0'],
            'is_active' => ['nullable', 'boolean'],
            'meta_title' => ['nullable', 'string', 'max:255'],
            'meta_description' => ['nullable', 'string'],
            'featured_image' => ['required', 'file', 'image', 'mimes:jpg,jpeg,png,webp', 'max:10240'],
            'gallery' => ['nullable', 'array', 'max:12'],
            'gallery.*' => ['file', 'image', 'mimes:jpg,jpeg,png,webp', 'max:10240'],
        ];
    }
}
