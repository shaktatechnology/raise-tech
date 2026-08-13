<?php

namespace Database\Factories;

use App\Models\BillingAddress;
use App\Models\Order;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<BillingAddress>
 */
class BillingAddressFactory extends Factory
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
