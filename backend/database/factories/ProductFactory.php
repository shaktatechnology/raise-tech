<?php

namespace Database\Factories;

use App\Models\Product;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<Product>
 */
class ProductFactory extends Factory
{
    public function definition(): array
    {
        $title = fake()->unique()->words(3, true);

        return [
            'title' => Str::title($title),
            'slug' => Str::slug($title).'-'.fake()->unique()->numberBetween(1, 999999),
            'sku' => fake()->unique()->bothify('RT-####-????'),
            'short_description' => fake()->sentence(),
            'description' => fake()->paragraph(),
            'original_price' => fake()->randomFloat(2, 100, 10000),
            'discount_type' => null,
            'discount_value' => 0,
            'stock_quantity' => 20,
            'sold_count' => 0,
            'featured_image' => 'products/placeholder.jpg',
            'is_active' => true,
            'meta_title' => null,
            'meta_description' => null,
        ];
    }
}
