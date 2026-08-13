<?php

namespace Database\Factories;

use App\Models\Order;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Order>
 */
class OrderFactory extends Factory
{
    public function definition(): array
    {
        return [
            'user_id' => null,
            'customer_name' => fake()->name(),
            'customer_email' => fake()->safeEmail(),
            'customer_phone' => '+97798'.fake()->numerify('########'),
            'shipping_address' => null,
            'city' => null,
            'payment_method' => 'cash_on_delivery',
            'status' => 'pending',
            'subtotal' => 1000,
            'shipping_charge' => 0,
            'total' => 1000,
            'notes' => null,
        ];
    }
}
