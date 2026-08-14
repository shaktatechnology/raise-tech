<?php

namespace Tests\Feature;

use App\Models\Cart;
use App\Models\CartItem;
use App\Models\Product;
use App\Models\User;
use Illuminate\Database\QueryException;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class CartApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_unauthenticated_request_is_rejected_with_401(): void
    {
        $this->getJson('/api/cart')->assertUnauthorized();
        $this->postJson('/api/cart/items', ['product_id' => 1, 'quantity' => 1])->assertUnauthorized();
        $this->patchJson('/api/cart/items/1', ['quantity' => 2])->assertUnauthorized();
        $this->deleteJson('/api/cart/items/1')->assertUnauthorized();
        $this->deleteJson('/api/cart')->assertUnauthorized();
        $this->postJson('/api/cart/merge', ['items' => []])->assertUnauthorized();
    }

    public function test_authenticated_user_retrieves_empty_cart(): void
    {
        $user = User::factory()->create();
        Sanctum::actingAs($user);

        $response = $this->getJson('/api/cart');

        $response
            ->assertOk()
            ->assertJsonPath('data.total_items', 0)
            ->assertJsonPath('data.total_quantity', 0)
            ->assertJsonPath('data.subtotal', '0.00')
            ->assertJsonPath('data.items', []);

        $this->assertDatabaseHas('carts', ['user_id' => $user->id]);
    }

    public function test_can_add_product_to_cart_and_calculate_discounted_subtotal(): void
    {
        $product = Product::factory()->create([
            'original_price' => 200.00,
            'discount_type' => 'fixed',
            'discount_value' => 50.00,
            'stock_quantity' => 10,
            'is_active' => true,
        ]);

        $user = User::factory()->create();
        Sanctum::actingAs($user);

        $response = $this->postJson('/api/cart/items', [
            'product_id' => $product->id,
            'quantity' => 2,
        ]);

        $response
            ->assertOk()
            ->assertJsonPath('data.total_items', 1)
            ->assertJsonPath('data.total_quantity', 2)
            ->assertJsonPath('data.subtotal', '300.00')
            ->assertJsonPath('data.items.0.unit_price', '150.00')
            ->assertJsonPath('data.items.0.subtotal', '300.00');

        $this->assertSame(10, $product->fresh()->stock_quantity);
    }

    public function test_duplicate_add_increments_quantity(): void
    {
        $product = Product::factory()->create([
            'original_price' => 100.00,
            'stock_quantity' => 10,
            'is_active' => true,
        ]);

        $user = User::factory()->create();
        Sanctum::actingAs($user);

        $this->postJson('/api/cart/items', ['product_id' => $product->id, 'quantity' => 2])->assertOk();
        $response = $this->postJson('/api/cart/items', ['product_id' => $product->id, 'quantity' => 3])->assertOk();

        $response
            ->assertJsonPath('data.total_items', 1)
            ->assertJsonPath('data.total_quantity', 5)
            ->assertJsonPath('data.subtotal', '500.00');
    }

    public function test_can_update_item_quantity_using_patch(): void
    {
        $product = Product::factory()->create([
            'original_price' => 50.00,
            'stock_quantity' => 10,
            'is_active' => true,
        ]);

        $user = User::factory()->create();
        Sanctum::actingAs($user);

        $addResponse = $this->postJson('/api/cart/items', [
            'product_id' => $product->id,
            'quantity' => 1,
        ])->assertOk();

        $cartItemId = $addResponse->json('data.items.0.id');

        $updateResponse = $this->patchJson("/api/cart/items/{$cartItemId}", [
            'quantity' => 4,
        ]);

        $updateResponse
            ->assertOk()
            ->assertJsonPath('data.total_quantity', 4)
            ->assertJsonPath('data.subtotal', '200.00');
    }

    public function test_can_remove_single_item(): void
    {
        $p1 = Product::factory()->create(['is_active' => true]);
        $p2 = Product::factory()->create(['is_active' => true]);

        $user = User::factory()->create();
        Sanctum::actingAs($user);

        $this->postJson('/api/cart/items', ['product_id' => $p1->id, 'quantity' => 1]);
        $add2 = $this->postJson('/api/cart/items', ['product_id' => $p2->id, 'quantity' => 1]);

        $itemId2 = $add2->json('data.items.1.id');

        $deleteResponse = $this->deleteJson("/api/cart/items/{$itemId2}");

        $deleteResponse
            ->assertOk()
            ->assertJsonPath('data.total_items', 1);
    }

    public function test_can_clear_cart(): void
    {
        $product = Product::factory()->create(['is_active' => true]);

        $user = User::factory()->create();
        Sanctum::actingAs($user);

        $this->postJson('/api/cart/items', ['product_id' => $product->id, 'quantity' => 3]);

        $clearResponse = $this->deleteJson('/api/cart');

        $clearResponse
            ->assertOk()
            ->assertJsonPath('data.total_items', 0)
            ->assertJsonPath('data.subtotal', '0.00');
    }

    public function test_rejects_inactive_or_missing_product(): void
    {
        $user = User::factory()->create();
        Sanctum::actingAs($user);

        $this->postJson('/api/cart/items', ['product_id' => 999999, 'quantity' => 1])
            ->assertUnprocessable()
            ->assertJsonValidationErrors('product_id');

        $inactive = Product::factory()->create(['is_active' => false]);
        $this->postJson('/api/cart/items', ['product_id' => $inactive->id, 'quantity' => 1])
            ->assertUnprocessable()
            ->assertJsonValidationErrors('product_id');
    }

    public function test_rejects_invalid_quantities(): void
    {
        $product = Product::factory()->create(['is_active' => true]);
        $user = User::factory()->create();
        Sanctum::actingAs($user);

        foreach ([0, -1, 'invalid'] as $invalidQty) {
            $this->postJson('/api/cart/items', ['product_id' => $product->id, 'quantity' => $invalidQty])
                ->assertUnprocessable()
                ->assertJsonValidationErrors('quantity');
        }
    }

    public function test_rejects_over_stock_requests(): void
    {
        $product = Product::factory()->create(['stock_quantity' => 2, 'is_active' => true]);
        $user = User::factory()->create();
        Sanctum::actingAs($user);

        $this->postJson('/api/cart/items', ['product_id' => $product->id, 'quantity' => 5])
            ->assertUnprocessable()
            ->assertJsonValidationErrors('quantity');
    }

    public function test_cross_user_isolation_user_a_cannot_access_or_modify_user_b_cart_item(): void
    {
        $userA = User::factory()->create();
        $userB = User::factory()->create();
        $product = Product::factory()->create(['is_active' => true]);

        $cartB = Cart::factory()->for($userB)->create();
        $itemB = CartItem::factory()->for($cartB)->for($product)->create(['quantity' => 1]);

        Sanctum::actingAs($userA);

        $this->patchJson("/api/cart/items/{$itemB->id}", ['quantity' => 5])
            ->assertNotFound();

        $this->deleteJson("/api/cart/items/{$itemB->id}")
            ->assertNotFound();
    }

    public function test_protected_field_tampering_is_ignored_or_prevented(): void
    {
        $user = User::factory()->create();
        $otherUser = User::factory()->create();
        $product = Product::factory()->create(['original_price' => 100.00, 'is_active' => true]);

        Sanctum::actingAs($user);

        $response = $this->postJson('/api/cart/items', [
            'product_id' => $product->id,
            'quantity' => 1,
            'user_id' => $otherUser->id,
            'unit_price' => 1.00,
            'subtotal' => 1.00,
            'is_active' => false,
        ])->assertOk();

        $response
            ->assertJsonPath('data.subtotal', '100.00')
            ->assertJsonPath('data.items.0.unit_price', '100.00');
    }

    public function test_cart_subtotal_updates_dynamically_when_product_price_changes(): void
    {
        $product = Product::factory()->create(['original_price' => 100.00, 'is_active' => true]);
        $user = User::factory()->create();
        Sanctum::actingAs($user);

        $this->postJson('/api/cart/items', ['product_id' => $product->id, 'quantity' => 2])->assertOk();

        $product->update(['original_price' => 200.00]);

        $this->getJson('/api/cart')
            ->assertOk()
            ->assertJsonPath('data.subtotal', '400.00')
            ->assertJsonPath('data.items.0.unit_price', '200.00');
    }

    public function test_percentage_discount_calculation(): void
    {
        $product = Product::factory()->create([
            'original_price' => 200.00,
            'discount_type' => 'percentage',
            'discount_value' => 20, // 20% off -> 160.00
            'is_active' => true,
        ]);

        $user = User::factory()->create();
        Sanctum::actingAs($user);

        $this->postJson('/api/cart/items', ['product_id' => $product->id, 'quantity' => 1])
            ->assertOk()
            ->assertJsonPath('data.items.0.unit_price', '160.00')
            ->assertJsonPath('data.subtotal', '160.00');
    }

    public function test_cart_operations_do_not_decrement_product_stock(): void
    {
        $product = Product::factory()->create(['stock_quantity' => 10, 'is_active' => true]);
        $user = User::factory()->create();
        Sanctum::actingAs($user);

        $this->postJson('/api/cart/items', ['product_id' => $product->id, 'quantity' => 3])->assertOk();

        $this->assertSame(10, $product->fresh()->stock_quantity);
    }

    public function test_successful_additive_guest_cart_merge(): void
    {
        $p1 = Product::factory()->create(['original_price' => 100.00, 'stock_quantity' => 10, 'is_active' => true]);
        $p2 = Product::factory()->create(['original_price' => 50.00, 'stock_quantity' => 10, 'is_active' => true]);

        $user = User::factory()->create();
        Sanctum::actingAs($user);

        // User already has 1 of p1 in cart
        $this->postJson('/api/cart/items', ['product_id' => $p1->id, 'quantity' => 1])->assertOk();

        // Merge guest localStorage items (2 of p1, 3 of p2)
        $mergeResponse = $this->postJson('/api/cart/merge', [
            'items' => [
                ['product_id' => $p1->id, 'quantity' => 2],
                ['product_id' => $p2->id, 'quantity' => 3],
            ],
        ]);

        $mergeResponse
            ->assertOk()
            ->assertJsonPath('data.total_items', 2)
            ->assertJsonPath('data.total_quantity', 6) // (1+2) + 3 = 6
            ->assertJsonPath('data.subtotal', '450.00'); // (3*100) + (3*50) = 450
    }

    public function test_merge_fails_and_rolls_back_if_any_item_exceeds_stock_or_has_duplicates(): void
    {
        $p1 = Product::factory()->create(['stock_quantity' => 2, 'is_active' => true]);
        $user = User::factory()->create();
        Sanctum::actingAs($user);

        // Existing item: quantity 1
        $this->postJson('/api/cart/items', ['product_id' => $p1->id, 'quantity' => 1])->assertOk();

        // Merge payload attempts 3 more (1+3 = 4 > stock 2) -> must fail completely
        $this->postJson('/api/cart/merge', [
            'items' => [
                ['product_id' => $p1->id, 'quantity' => 3],
            ],
        ])->assertUnprocessable();

        // Database cart remains untouched (quantity 1)
        $this->getJson('/api/cart')
            ->assertOk()
            ->assertJsonPath('data.total_quantity', 1);

        // Reject duplicate product IDs in input payload
        $this->postJson('/api/cart/merge', [
            'items' => [
                ['product_id' => $p1->id, 'quantity' => 1],
                ['product_id' => $p1->id, 'quantity' => 1],
            ],
        ])->assertUnprocessable();
    }

    public function test_unique_cart_item_constraint_prevents_duplicate_rows(): void
    {
        $cart = Cart::factory()->create();
        $product = Product::factory()->create();

        CartItem::create(['cart_id' => $cart->id, 'product_id' => $product->id, 'quantity' => 1]);

        $this->expectException(QueryException::class);
        CartItem::create(['cart_id' => $cart->id, 'product_id' => $product->id, 'quantity' => 1]);
    }
}
