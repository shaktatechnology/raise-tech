<?php

namespace Database\Factories;

use App\Models\Order;
use App\Models\ShippingAddress;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<ShippingAddress>
 */
class ShippingAddressFactory extends Factory
{
    public function definition(): array
    {
        return [
            'order_id' => Order::factory(),
            'name' => fake()->name(),
            'address' => fake()->streetAddress(),
            'city' => fake()->city(),
            'province' => 'Bagmati',
            'phone_number' => '+97798'.fake()->numerify('########'),
        ];
    }
}
