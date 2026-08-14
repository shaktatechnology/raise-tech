<?php

namespace App\Http\Controllers;

use App\Http\Requests\AddToCartRequest;
use App\Http\Requests\MergeCartRequest;
use App\Http\Requests\UpdateCartItemRequest;
use App\Http\Resources\CartResource;
use App\Services\CartService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CartController extends Controller
{
    /**
     * Retrieve the authenticated user's active cart.
     */
    public function index(Request $request, CartService $cartService): JsonResponse
    {
        $cart = $cartService->getOrCreateUserCart($request->user());

        return response()->json([
            'status' => 'success',
            'data' => new CartResource($cart),
        ]);
    }

    /**
     * Add a product to the authenticated user's cart.
     */
    public function addItem(AddToCartRequest $request, CartService $cartService): JsonResponse
    {
        $validated = $request->validated();

        $cart = $cartService->addItem(
            $request->user(),
            (int) $validated['product_id'],
            (int) $validated['quantity'],
        );

        return response()->json([
            'message' => 'Product added to cart successfully.',
            'data' => new CartResource($cart),
        ]);
    }

    /**
     * Update the quantity of a specific cart item.
     */
    public function updateItem(UpdateCartItemRequest $request, int $cartItem, CartService $cartService): JsonResponse
    {
        $validated = $request->validated();

        $cart = $cartService->updateItemQuantity(
            $request->user(),
            $cartItem,
            (int) $validated['quantity'],
        );

        return response()->json([
            'message' => 'Cart item quantity updated successfully.',
            'data' => new CartResource($cart),
        ]);
    }

    /**
     * Remove a single item from the user's active cart.
     */
    public function removeItem(Request $request, int $cartItem, CartService $cartService): JsonResponse
    {
        $cart = $cartService->removeItem($request->user(), $cartItem);

        return response()->json([
            'message' => 'Item removed from cart.',
            'data' => new CartResource($cart),
        ]);
    }

    /**
     * Clear all items from the user's active cart.
     */
    public function clearCart(Request $request, CartService $cartService): JsonResponse
    {
        $cart = $cartService->clearCart($request->user());

        return response()->json([
            'message' => 'Cart cleared successfully.',
            'data' => new CartResource($cart),
        ]);
    }

    /**
     * Merge guest cart items (from frontend localStorage) into user's cart upon login.
     */
    public function mergeCart(MergeCartRequest $request, CartService $cartService): JsonResponse
    {
        $validated = $request->validated();

        $cart = $cartService->mergeGuestItems(
            $request->user(),
            $validated['items'],
        );

        return response()->json([
            'message' => 'Guest cart items merged successfully.',
            'data' => new CartResource($cart),
        ]);
    }
}
