<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class OrderController extends Controller
{
    /**
     * Public: Place an order (checkout)
     * Cart lives on the frontend — only product_id + quantity sent here.
     * Prices are ALWAYS fetched from the database (never trusted from frontend).
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'customer_name'    => 'required|string|max:255',
            'customer_email'   => 'required|email|max:255',
            'customer_phone'   => 'required|string|max:20',
            'shipping_address' => 'required|string',
            'city'             => 'required|string|max:100',
            'notes'            => 'nullable|string',
            'items'            => 'required|array|min:1',
            'items.*.product_id' => 'required|exists:products,id',
            'items.*.quantity'   => 'required|integer|min:1',
        ]);

        DB::beginTransaction();

        try {
            $subtotal = 0;
            $orderItemsData = [];

            foreach ($validated['items'] as $item) {
                // Always fetch price from DB — never trust frontend
                $product = Product::findOrFail($item['product_id']);

                if (!$product->is_active) {
                    return response()->json([
                        'message' => "Product '{$product->title}' is not available.",
                    ], 422);
                }

                if ($product->stock_quantity < $item['quantity']) {
                    return response()->json([
                        'message' => "Insufficient stock for '{$product->title}'. Available: {$product->stock_quantity}",
                    ], 422);
                }

                // Calculate effective price (apply discount if any)
                $unitPrice = $this->getEffectivePrice($product);
                $itemSubtotal = $unitPrice * $item['quantity'];
                $subtotal += $itemSubtotal;

                $orderItemsData[] = [
                    'product_id'    => $product->id,
                    'product_title' => $product->title,
                    'product_sku'   => $product->sku,
                    'unit_price'    => $unitPrice,
                    'quantity'      => $item['quantity'],
                    'subtotal'      => $itemSubtotal,
                ];
            }

            $shippingCharge = 0; // Free delivery, change if needed
            $total = $subtotal + $shippingCharge;

            // Create the order
            $order = Order::create([
                'user_id'          => auth('sanctum')->id(), // null for guests
                'customer_name'    => $validated['customer_name'],
                'customer_email'   => $validated['customer_email'],
                'customer_phone'   => $validated['customer_phone'],
                'shipping_address' => $validated['shipping_address'],
                'city'             => $validated['city'],
                'payment_method'   => 'cash_on_delivery',
                'status'           => 'pending',
                'subtotal'         => $subtotal,
                'shipping_charge'  => $shippingCharge,
                'total'            => $total,
                'notes'            => $validated['notes'] ?? null,
            ]);

            // Create order items & update stock
            foreach ($orderItemsData as $index => $itemData) {
                OrderItem::create(array_merge(['order_id' => $order->id], $itemData));

                $product = Product::find($itemData['product_id']);
                $product->decrement('stock_quantity', $orderItemsData[$index]['quantity']);
                $product->increment('sold_count', $orderItemsData[$index]['quantity']);
            }

            DB::commit();

            return response()->json([
                'message' => 'Order placed successfully! We will contact you shortly.',
                'data'    => $order->load('items'),
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Failed to place order. Please try again.',
                'error'   => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Public (authenticated): Get the logged-in user's own orders
     */
    public function myOrders(Request $request)
    {
        $orders = Order::where('user_id', $request->user()->id)
            ->with('items')
            ->latest()
            ->get();

        return response()->json([
            'status' => 'success',
            'data'   => $orders,
        ]);
    }

    /**
     * Admin: List all orders (with optional status filter)
     */
    public function adminIndex(Request $request)
    {
        $query = Order::with('items')->latest();

        if ($request->has('status') && $request->status !== 'all') {
            $query->where('status', $request->status);
        }

        $orders = $query->get();

        return response()->json([
            'status' => 'success',
            'data'   => $orders,
        ]);
    }

    /**
     * Admin: View a single order in detail
     */
    public function adminShow(Order $order)
    {
        return response()->json([
            'status' => 'success',
            'data'   => $order->load('items.product', 'user'),
        ]);
    }

    /**
     * Admin: Update order status
     */
    public function updateStatus(Request $request, Order $order)
    {
        $validated = $request->validate([
            'status' => 'required|in:pending,confirmed,processing,shipped,delivered,cancelled',
        ]);

        $order->update(['status' => $validated['status']]);

        return response()->json([
            'message' => 'Order status updated successfully',
            'data'    => $order,
        ]);
    }

    /**
     * Admin: Delete an order
     */
    public function destroy(Order $order)
    {
        $order->delete(); // cascades to order_items via DB constraint

        return response()->json([
            'message' => 'Order deleted successfully',
        ]);
    }

    /**
     * Helper: Calculate effective unit price after discount
     */
    private function getEffectivePrice(Product $product): float
    {
        if (!$product->discount_type || !$product->discount_value) {
            return (float) $product->original_price;
        }

        if ($product->discount_type === 'percentage') {
            $discount = $product->original_price * ($product->discount_value / 100);
            return max(0, (float) $product->original_price - $discount);
        }

        if ($product->discount_type === 'fixed') {
            return max(0, (float) $product->original_price - (float) $product->discount_value);
        }

        return (float) $product->original_price;
    }
}
