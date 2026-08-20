<?php

namespace Tests\Feature;

use App\Models\Cart;
use App\Models\CartItem;
use App\Models\Order;
use App\Models\Product;
use App\Models\User;
use App\Models\UserAddress;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class GuestAuthenticatedCheckoutTest extends TestCase
{
    use RefreshDatabase;

    public function test_guest_order_has_no_user_or_reusable_profile_but_keeps_delivery_snapshots(): void
    {
        $product = Product::factory()->create([
            'original_price' => 500,
            'stock_quantity' => 5,
        ]);

        $response = $this->postJson('/api/orders', $this->payload($product))
            ->assertCreated()
            ->assertJsonPath('data.user_id', null)
            ->assertJsonPath('data.shipping_address.city', 'Bhaktapur')
            ->assertJsonPath('data.billing_address.city', 'Bhaktapur')
            ->assertJsonPath('data.shipping_charge', '100.00')
            ->assertJsonPath('data.total', '1100.00');

        $this->assertDatabaseHas('orders', [
            'id' => $response->json('data.id'),
            'user_id' => null,
            'customer_email' => 'guest@example.com',
        ]);
        $this->assertDatabaseCount('users', 0);
        $this->assertDatabaseCount('user_addresses', 0);
    }

    public function test_guest_cannot_save_reusable_checkout_details(): void
    {
        $payload = $this->payload(Product::factory()->create());
        $payload['save_for_future'] = true;

        $this->postJson('/api/orders', $payload)
            ->assertUnprocessable()
            ->assertJsonValidationErrors('save_for_future');

        $this->assertDatabaseCount('orders', 0);
        $this->assertDatabaseCount('users', 0);
        $this->assertDatabaseCount('user_addresses', 0);
    }

    public function test_authenticated_checkout_belongs_to_token_user_ignores_client_user_id_and_clears_cart(): void
    {
        $user = User::factory()->create();
        $otherUser = User::factory()->create();
        $product = Product::factory()->create(['stock_quantity' => 10]);
        $cart = Cart::factory()->for($user)->create();
        CartItem::factory()->for($cart)->for($product)->create(['quantity' => 2]);

        Sanctum::actingAs($user);
        $payload = $this->payload($product);
        $payload['user_id'] = $otherUser->id;

        $response = $this->postJson('/api/orders', $payload)
            ->assertCreated()
            ->assertJsonPath('data.user_id', $user->id);

        $this->assertDatabaseHas('orders', [
            'id' => $response->json('data.id'),
            'user_id' => $user->id,
        ]);
        $this->assertDatabaseCount('cart_items', 0);

        $this->getJson('/api/my-orders')
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.id', $response->json('data.id'));
    }

    public function test_google_login_sanctum_token_can_create_a_user_owned_order(): void
    {
        Http::fake([
            'https://oauth2.googleapis.com/tokeninfo*' => Http::response([
                'sub' => 'google-checkout-test-id',
                'name' => 'Google Checkout User',
                'email' => 'google-checkout@example.com',
                'email_verified' => 'true',
            ]),
        ]);

        $login = $this->postJson('/api/google-login', [
            'token' => 'verified-google-credential',
        ])
            ->assertOk()
            ->assertJsonPath('user.name', 'Google Checkout User')
            ->assertJsonPath('user.email', 'google-checkout@example.com');

        $user = User::query()->where('email', 'google-checkout@example.com')->firstOrFail();
        $payload = $this->payload(Product::factory()->create());
        $payload['customer_name'] = 'Google Checkout User';
        $payload['customer_email'] = 'google-checkout@example.com';

        $this->withToken($login->json('access_token'))
            ->postJson('/api/orders', $payload)
            ->assertCreated()
            ->assertJsonPath('data.user_id', $user->id);

        $this->assertDatabaseHas('orders', [
            'user_id' => $user->id,
            'customer_email' => 'google-checkout@example.com',
        ]);
    }

    public function test_save_for_future_stores_phone_and_default_address_for_prefill(): void
    {
        $user = User::factory()->create([
            'name' => 'Google Customer',
            'email' => 'google@example.com',
            'phone' => null,
        ]);
        Sanctum::actingAs($user);

        $payload = $this->payload(Product::factory()->create());
        $payload['save_for_future'] = true;

        $this->postJson('/api/orders', $payload)->assertCreated();

        $this->assertSame('+9779800000000', $user->fresh()->phone);
        $this->assertDatabaseHas('user_addresses', [
            'user_id' => $user->id,
            'type' => 'shipping',
            'address' => 'Suryabinayak 4',
            'is_default' => true,
        ]);
        $this->assertDatabaseMissing('user_addresses', [
            'user_id' => $user->id,
            'type' => 'billing',
        ]);

        $this->getJson('/api/checkout-profile')
            ->assertOk()
            ->assertJsonPath('data.user.name', 'Google Customer')
            ->assertJsonPath('data.user.email', 'google@example.com')
            ->assertJsonPath('data.user.phone', '+9779800000000')
            ->assertJsonPath('data.shipping_address.city', 'Bhaktapur')
            ->assertJsonPath('data.billing_address', null);
    }

    public function test_save_for_future_with_separate_billing_stores_both_reusable_addresses(): void
    {
        $user = User::factory()->create();
        Sanctum::actingAs($user);
        $payload = $this->payload(Product::factory()->create());
        $payload['save_for_future'] = true;
        $payload['billing_same_as_shipping'] = false;
        $payload['billing_address'] = [
            'name' => 'Accounts Team',
            'address' => 'New Road',
            'city' => 'Kathmandu',
            'province' => 'Bagmati',
            'phone_number' => '+9779811111111',
        ];

        $this->postJson('/api/orders', $payload)->assertCreated();

        $this->assertDatabaseHas('user_addresses', [
            'user_id' => $user->id,
            'type' => 'shipping',
            'city' => 'Bhaktapur',
        ]);
        $this->assertDatabaseHas('user_addresses', [
            'user_id' => $user->id,
            'type' => 'billing',
            'city' => 'Kathmandu',
        ]);
    }

    public function test_save_for_future_false_does_not_overwrite_saved_information(): void
    {
        $user = User::factory()->create(['phone' => '+9779812345678']);
        $savedAddress = $this->createAddress($user, 'Old address');
        Sanctum::actingAs($user);

        $payload = $this->payload(Product::factory()->create());
        $payload['save_for_future'] = false;

        $this->postJson('/api/orders', $payload)->assertCreated();

        $this->assertSame('+9779812345678', $user->fresh()->phone);
        $this->assertSame('Old address', $savedAddress->fresh()->address);
    }

    public function test_updating_saved_information_never_changes_an_older_order_snapshot(): void
    {
        $user = User::factory()->create();
        Sanctum::actingAs($user);
        $firstProduct = Product::factory()->create();
        $firstPayload = $this->payload($firstProduct);
        $firstPayload['save_for_future'] = true;

        $firstResponse = $this->postJson('/api/orders', $firstPayload)->assertCreated();

        $secondPayload = $this->payload(Product::factory()->create());
        $secondPayload['save_for_future'] = true;
        $secondPayload['shipping_address']['address'] = 'A completely new address';

        $this->postJson('/api/orders', $secondPayload)->assertCreated();

        $oldOrder = Order::query()->with('shippingAddress')->findOrFail($firstResponse->json('data.id'));
        $this->assertSame('Suryabinayak 4', $oldOrder->shippingAddress->address);
        $this->assertDatabaseHas('user_addresses', [
            'user_id' => $user->id,
            'type' => 'shipping',
            'address' => 'A completely new address',
        ]);
    }

    public function test_checkout_profile_only_returns_the_authenticated_users_address(): void
    {
        $owner = User::factory()->create();
        $other = User::factory()->create();
        $this->createAddress($owner, 'Owner address');
        $this->createAddress($other, 'Other private address');

        Sanctum::actingAs($other);

        $this->getJson('/api/checkout-profile')
            ->assertOk()
            ->assertJsonPath('data.shipping_address.address', 'Other private address')
            ->assertJsonMissing(['address' => 'Owner address']);
    }

    public function test_invalid_bearer_token_is_not_silently_downgraded_to_guest_checkout(): void
    {
        $this->withToken('invalid-token')
            ->postJson('/api/orders', $this->payload(Product::factory()->create()))
            ->assertUnauthorized()
            ->assertJsonPath(
                'message',
                'Your session has expired. Please sign in again before checking out.',
            );

        $this->assertDatabaseCount('orders', 0);
    }

    public function test_failed_authenticated_checkout_preserves_server_cart(): void
    {
        $user = User::factory()->create();
        $product = Product::factory()->create(['stock_quantity' => 1]);
        $cart = Cart::factory()->for($user)->create();
        $cartItem = CartItem::factory()->for($cart)->for($product)->create(['quantity' => 1]);
        Sanctum::actingAs($user);

        $payload = $this->payload($product);
        $payload['items'][0]['quantity'] = 2;

        $this->postJson('/api/orders', $payload)
            ->assertUnprocessable()
            ->assertJsonValidationErrors('items.0.quantity');

        $this->assertDatabaseHas('cart_items', [
            'id' => $cartItem->id,
            'quantity' => 1,
        ]);
        $this->assertDatabaseCount('orders', 0);
    }

    public function test_profile_write_failure_rolls_back_order_stock_cart_and_user_changes(): void
    {
        $user = User::factory()->create(['phone' => null]);
        $product = Product::factory()->create(['stock_quantity' => 10, 'sold_count' => 0]);
        $cart = Cart::factory()->for($user)->create();
        $cartItem = CartItem::factory()->for($cart)->for($product)->create(['quantity' => 1]);
        Sanctum::actingAs($user);

        DB::unprepared(<<<'SQL'
            CREATE TRIGGER fail_user_address_insert
            BEFORE INSERT ON user_addresses
            BEGIN
                SELECT RAISE(ABORT, 'forced user address failure');
            END
            SQL);

        $payload = $this->payload($product);
        $payload['save_for_future'] = true;

        try {
            $this->postJson('/api/orders', $payload)->assertInternalServerError();
        } finally {
            DB::unprepared('DROP TRIGGER IF EXISTS fail_user_address_insert');
        }

        $this->assertDatabaseCount('orders', 0);
        $this->assertDatabaseCount('order_items', 0);
        $this->assertDatabaseCount('shipping_addresses', 0);
        $this->assertDatabaseCount('billing_addresses', 0);
        $this->assertDatabaseCount('user_addresses', 0);
        $this->assertDatabaseHas('cart_items', ['id' => $cartItem->id]);
        $this->assertNull($user->fresh()->phone);
        $this->assertSame(10, $product->fresh()->stock_quantity);
        $this->assertSame(0, $product->fresh()->sold_count);
    }

    public function test_required_checkout_validation_applies_to_guest_and_authenticated_modes(): void
    {
        $product = Product::factory()->create();
        $payload = $this->payload($product);
        unset($payload['customer_phone'], $payload['shipping_address']['province']);

        $this->postJson('/api/orders', $payload)
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['customer_phone', 'shipping_address.province']);

        Sanctum::actingAs(User::factory()->create());

        $this->postJson('/api/orders', $payload)
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['customer_phone', 'shipping_address.province']);
    }

    public function test_backend_calculates_discount_shipping_and_total_for_express_delivery(): void
    {
        $product = Product::factory()->create([
            'original_price' => 1000,
            'discount_type' => 'percentage',
            'discount_value' => 10,
            'stock_quantity' => 5,
        ]);
        $payload = $this->payload($product);
        $payload['delivery_type'] = 'express';
        $payload['subtotal'] = 1;
        $payload['shipping_charge'] = 1;
        $payload['total'] = 2;

        $this->postJson('/api/orders', $payload)
            ->assertCreated()
            ->assertJsonPath('data.subtotal', '1800.00')
            ->assertJsonPath('data.shipping_charge', '250.00')
            ->assertJsonPath('data.total', '2050.00');
    }

    /**
     * @return array<string, mixed>
     */
    private function payload(Product $product): array
    {
        return [
            'customer_name' => 'Guest Customer',
            'customer_email' => 'guest@example.com',
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
                'name' => 'Guest Customer',
                'address' => 'Suryabinayak 4',
                'city' => 'Bhaktapur',
                'province' => 'Bagmati',
                'phone_number' => '+9779800000000',
            ],
            'billing_same_as_shipping' => true,
            'billing_address' => null,
            'save_for_future' => false,
        ];
    }

    private function createAddress(User $user, string $address): UserAddress
    {
        return $user->addresses()->create([
            'type' => 'shipping',
            'label' => 'Checkout',
            'name' => $user->name,
            'phone_number' => '+9779812345678',
            'address' => $address,
            'city' => 'Kathmandu',
            'province' => 'Bagmati',
            'is_default' => true,
        ]);
    }
}
