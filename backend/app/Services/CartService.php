<?php

namespace App\Services;

use App\Models\Cart;
use App\Models\CartItem;
use App\Models\Product;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class CartService
{
    public function getOrCreateUserCart(User $user): Cart
    {
        return DB::transaction(function () use ($user): Cart {
            $cart = Cart::query()
                ->where('user_id', $user->id)
                ->lockForUpdate()
                ->first();

            if ($cart === null) {
                $cart = Cart::create(['user_id' => $user->id]);
            }

            return $cart->load(['items.product']);
        });
    }

    public function addItem(User $user, int $productId, int $quantity): Cart
    {
        return DB::transaction(function () use ($user, $productId, $quantity): Cart {
            $cart = Cart::query()->firstOrCreate(['user_id' => $user->id]);

            /** @var Product|null $product */
            $product = Product::query()
                ->whereKey($productId)
                ->lockForUpdate()
                ->first();

            if ($product === null || ! $product->is_active) {
                throw ValidationException::withMessages([
                    'product_id' => ['The selected product is unavailable.'],
                ]);
            }

            /** @var CartItem|null $existingItem */
            $existingItem = $cart->items()
                ->where('product_id', $productId)
                ->first();

            $currentQty = $existingItem ? $existingItem->quantity : 0;
            $newQty = $currentQty + $quantity;

            if ($product->stock_quantity < $newQty) {
                throw ValidationException::withMessages([
                    'quantity' => ["Insufficient stock for '{$product->title}'. Available stock: {$product->stock_quantity}."],
                ]);
            }

            if ($existingItem !== null) {
                $existingItem->update(['quantity' => $newQty]);
            } else {
                $cart->items()->create([
                    'product_id' => $productId,
                    'quantity' => $quantity,
                ]);
            }

            return $cart->load(['items.product']);
        });
    }

    public function updateItemQuantity(User $user, int $cartItemId, int $quantity): Cart
    {
        return DB::transaction(function () use ($user, $cartItemId, $quantity): Cart {
            $cart = Cart::query()->firstOrCreate(['user_id' => $user->id]);

            /** @var CartItem|null $cartItem */
            $cartItem = $cart->items()
                ->where('id', $cartItemId)
                ->first();

            if ($cartItem === null) {
                abort(404, 'Cart item not found.');
            }

            /** @var Product|null $product */
            $product = Product::query()
                ->whereKey($cartItem->product_id)
                ->lockForUpdate()
                ->first();

            if ($product === null || ! $product->is_active) {
                throw ValidationException::withMessages([
                    'cart_item' => ['Product is no longer available.'],
                ]);
            }

            if ($product->stock_quantity < $quantity) {
                throw ValidationException::withMessages([
                    'quantity' => ["Insufficient stock for '{$product->title}'. Available stock: {$product->stock_quantity}."],
                ]);
            }

            $cartItem->update(['quantity' => $quantity]);

            return $cart->load(['items.product']);
        });
    }

    public function removeItem(User $user, int $cartItemId): Cart
    {
        return DB::transaction(function () use ($user, $cartItemId): Cart {
            $cart = Cart::query()->firstOrCreate(['user_id' => $user->id]);

            /** @var CartItem|null $cartItem */
            $cartItem = $cart->items()
                ->where('id', $cartItemId)
                ->first();

            if ($cartItem === null) {
                abort(404, 'Cart item not found.');
            }

            $cartItem->delete();

            return $cart->load(['items.product']);
        });
    }

    public function clearCart(User $user): Cart
    {
        return DB::transaction(function () use ($user): Cart {
            $cart = Cart::query()->firstOrCreate(['user_id' => $user->id]);
            $cart->items()->delete();

            return $cart->load(['items.product']);
        });
    }

    /**
     * @param  array<int, array{product_id: int, quantity: int}>  $guestItems
     */
    public function mergeGuestItems(User $user, array $guestItems): Cart
    {
        return DB::transaction(function () use ($user, $guestItems): Cart {
            $cart = Cart::query()->firstOrCreate(['user_id' => $user->id]);

            if (empty($guestItems)) {
                return $cart->load(['items.product']);
            }

            // Check for duplicate product IDs in the input payload
            $productIds = array_column($guestItems, 'product_id');
            if (count($productIds) !== count(array_unique($productIds))) {
                throw ValidationException::withMessages([
                    'items' => ['Duplicate products detected in guest cart items payload.'],
                ]);
            }

            // Lock products for update
            $products = Product::query()
                ->whereIn('id', $productIds)
                ->lockForUpdate()
                ->get()
                ->keyBy('id');

            // Validate all products and stock upfront
            foreach ($guestItems as $index => $guestItem) {
                $pid = $guestItem['product_id'];
                $qty = $guestItem['quantity'];

                /** @var Product|null $product */
                $product = $products->get($pid);

                if ($product === null || ! $product->is_active) {
                    throw ValidationException::withMessages([
                        "items.{$index}.product_id" => ['One or more guest cart products are unavailable.'],
                    ]);
                }

                /** @var CartItem|null $existingItem */
                $existingItem = $cart->items()->where('product_id', $pid)->first();
                $currentQty = $existingItem ? $existingItem->quantity : 0;
                $newQty = $currentQty + $qty;

                if ($product->stock_quantity < $newQty) {
                    throw ValidationException::withMessages([
                        "items.{$index}.quantity" => ["Insufficient stock for '{$product->title}'. Available: {$product->stock_quantity}."],
                    ]);
                }
            }

            // Perform atomic merge
            foreach ($guestItems as $guestItem) {
                $pid = $guestItem['product_id'];
                $qty = $guestItem['quantity'];

                /** @var CartItem|null $existingItem */
                $existingItem = $cart->items()->where('product_id', $pid)->first();

                if ($existingItem !== null) {
                    $existingItem->update(['quantity' => $existingItem->quantity + $qty]);
                } else {
                    $cart->items()->create([
                        'product_id' => $pid,
                        'quantity' => $qty,
                    ]);
                }
            }

            return $cart->load(['items.product']);
        });
    }
}
