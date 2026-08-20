<?php

namespace Tests\Feature;

use App\Models\BillingAddress;
use App\Models\Order;
use App\Models\Product;
use App\Models\ShippingAddress;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class OrderCheckoutAddressesTest extends TestCase
{
    use RefreshDatabase;

    public function test_guest_can_checkout_with_separate_shipping_and_billing_addresses(): void
    {
        $product = Product::factory()->create([
            'original_price' => 1250.50,
            'stock_quantity' => 10,
        ]);

        $response = $this->postJson('/api/orders', $this->checkoutPayload($product));

        $response
            ->assertCreated()
            ->assertJsonPath('data.customer_name', 'Example Customer')
            ->assertJsonPath('data.shipping_address.city', 'Bhaktapur')
            ->assertJsonPath('data.billing_address.city', 'Kathmandu')
            ->assertJsonPath('data.subtotal', '2501.00')
            ->assertJsonPath('data.shipping_charge', '100.00')
            ->assertJsonPath('data.total', '2601.00');

        $orderId = $response->json('data.id');

        $this->assertDatabaseHas('shipping_addresses', [
            'order_id' => $orderId,
            'city' => 'Bhaktapur',
            'province' => 'Bagmati',
        ]);
        $this->assertDatabaseHas('billing_addresses', [
            'order_id' => $orderId,
            'city' => 'Kathmandu',
            'province' => 'Bagmati',
        ]);
    }

    public function test_same_as_shipping_creates_a_separate_billing_snapshot(): void
    {
        $product = Product::factory()->create();
        $payload = $this->checkoutPayload($product);
        $payload['billing_same_as_shipping'] = true;
        $payload['billing_address'] = null;

        $response = $this->postJson('/api/orders', $payload)->assertCreated();

        $order = Order::query()->findOrFail($response->json('data.id'));
        $shipping = $order->shippingAddress()->firstOrFail();
        $billing = $order->billingAddress()->firstOrFail();

        $this->assertSame(
            $shipping->only(['name', 'address', 'city', 'province', 'phone_number']),
            $billing->only(['name', 'address', 'city', 'province', 'phone_number']),
        );
        $this->assertSame($order->id, $shipping->order_id);
        $this->assertSame($order->id, $billing->order_id);
    }

    public function test_shipping_address_is_required(): void
    {
        $payload = $this->checkoutPayload(Product::factory()->create());
        unset($payload['shipping_address']);

        $this->postJson('/api/orders', $payload)
            ->assertUnprocessable()
            ->assertJsonValidationErrors('shipping_address');

        $this->assertDatabaseCount('orders', 0);
    }

    public function test_billing_address_is_required_when_it_is_not_the_shipping_address(): void
    {
        $payload = $this->checkoutPayload(Product::factory()->create());
        unset($payload['billing_address']);

        $this->postJson('/api/orders', $payload)
            ->assertUnprocessable()
            ->assertJsonValidationErrors('billing_address');
    }

    public function test_invalid_phone_number_is_rejected(): void
    {
        $payload = $this->checkoutPayload(Product::factory()->create());
        $payload['shipping_address']['phone_number'] = 'not-a-phone';

        $this->postJson('/api/orders', $payload)
            ->assertUnprocessable()
            ->assertJsonValidationErrors('shipping_address.phone_number');
    }

    public function test_city_and_province_are_required_in_each_address(): void
    {
        $product = Product::factory()->create();

        foreach (['city', 'province'] as $field) {
            $payload = $this->checkoutPayload($product);
            unset($payload['shipping_address'][$field]);

            $this->postJson('/api/orders', $payload)
                ->assertUnprocessable()
                ->assertJsonValidationErrors("shipping_address.{$field}");
        }
    }

    public function test_both_address_records_belong_to_the_created_order(): void
    {
        $response = $this->postJson(
            '/api/orders',
            $this->checkoutPayload(Product::factory()->create()),
        )->assertCreated();

        $order = Order::query()
            ->with(['shippingAddress', 'billingAddress'])
            ->findOrFail($response->json('data.id'));

        $this->assertInstanceOf(ShippingAddress::class, $order->shippingAddress);
        $this->assertInstanceOf(BillingAddress::class, $order->billingAddress);
        $this->assertTrue($order->is($order->shippingAddress->order));
        $this->assertTrue($order->is($order->billingAddress->order));
    }

    public function test_address_insert_failure_rolls_back_order_items_addresses_and_stock(): void
    {
        $product = Product::factory()->create([
            'stock_quantity' => 10,
            'sold_count' => 0,
        ]);

        DB::unprepared(<<<'SQL'
            CREATE TRIGGER fail_billing_address_insert
            BEFORE INSERT ON billing_addresses
            BEGIN
                SELECT RAISE(ABORT, 'forced billing address failure');
            END
            SQL);

        try {
            $this->postJson('/api/orders', $this->checkoutPayload($product))
                ->assertInternalServerError()
                ->assertJsonMissingPath('error');
        } finally {
            DB::unprepared('DROP TRIGGER IF EXISTS fail_billing_address_insert');
        }

        $this->assertDatabaseCount('orders', 0);
        $this->assertDatabaseCount('order_items', 0);
        $this->assertDatabaseCount('shipping_addresses', 0);
        $this->assertDatabaseCount('billing_addresses', 0);
        $this->assertSame(10, $product->fresh()->stock_quantity);
        $this->assertSame(0, $product->fresh()->sold_count);
    }

    public function test_customer_cannot_access_another_users_order_addresses(): void
    {
        $owner = User::factory()->create();
        $otherCustomer = User::factory()->create();
        $order = Order::factory()->for($owner)->create();
        ShippingAddress::factory()->for($order)->create();
        BillingAddress::factory()->for($order)->create();

        Sanctum::actingAs($otherCustomer);

        $this->getJson('/api/my-orders')
            ->assertOk()
            ->assertJsonCount(0, 'data');
        $this->getJson("/api/admin/orders/{$order->id}")
            ->assertForbidden();
    }

    public function test_checkout_response_contains_both_address_objects_without_foreign_keys(): void
    {
        $this->postJson(
            '/api/orders',
            $this->checkoutPayload(Product::factory()->create()),
        )
            ->assertCreated()
            ->assertJsonStructure([
                'data' => [
                    'shipping_address' => ['id', 'name', 'address', 'city', 'province', 'phone_number'],
                    'billing_address' => ['id', 'name', 'address', 'city', 'province', 'phone_number'],
                ],
            ])
            ->assertJsonMissingPath('data.shipping_address.order_id')
            ->assertJsonMissingPath('data.billing_address.order_id');
    }

    public function test_client_cannot_set_user_status_payment_status_or_totals(): void
    {
        $authenticatedUser = User::factory()->create();
        $otherUser = User::factory()->create();
        $product = Product::factory()->create([
            'original_price' => 100,
            'stock_quantity' => 10,
        ]);
        $payload = array_merge($this->checkoutPayload($product), [
            'user_id' => $otherUser->id,
            'status' => 'delivered',
            'payment_status' => 'paid',
            'subtotal' => 1,
            'shipping_charge' => 999,
            'total' => 1,
        ]);

        Sanctum::actingAs($authenticatedUser);

        $response = $this->postJson('/api/orders', $payload)->assertCreated();
        $order = Order::query()->findOrFail($response->json('data.id'));

        $this->assertSame($authenticatedUser->id, $order->user_id);
        $this->assertSame('pending', $order->status);
        $this->assertSame('200.00', $order->subtotal);
        $this->assertSame('100.00', $order->shipping_charge);
        $this->assertSame('300.00', $order->total);
        $this->assertFalse($order->getConnection()->getSchemaBuilder()->hasColumn('orders', 'payment_status'));
    }

    /**
     * @return array<string, mixed>
     */
    private function checkoutPayload(Product $product): array
    {
        return [
            'customer_name' => 'Example Customer',
            'customer_email' => 'customer@example.com',
            'customer_phone' => '+9779800000000',
            'delivery_type' => 'standard',
            'payment_method' => 'cash_on_delivery',
            'notes' => null,
            'items' => [
                [
                    'product_id' => $product->id,
                    'quantity' => 2,
                ],
            ],
            'shipping_address' => [
                'name' => 'Example Customer',
                'address' => 'Suryabinayak 4',
                'city' => 'Bhaktapur',
                'province' => 'Bagmati',
                'phone_number' => '+9779800000000',
            ],
            'billing_same_as_shipping' => false,
            'billing_address' => [
                'name' => 'Example Customer',
                'address' => 'New Road',
                'city' => 'Kathmandu',
                'province' => 'Bagmati',
                'phone_number' => '+9779800000000',
            ],
        ];
    }
}
