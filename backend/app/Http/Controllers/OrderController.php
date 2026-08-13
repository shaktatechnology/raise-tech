<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreOrderRequest;
use App\Http\Resources\OrderResource;
use App\Models\Order;
use App\Services\OrderService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Throwable;

class OrderController extends Controller
{
    /**
     * Public checkout for guests and optionally authenticated customers.
     */
    public function store(StoreOrderRequest $request, OrderService $orderService): JsonResponse
    {
        try {
            $order = $orderService->create(
                $request->validated(),
                $request->user('sanctum'),
            );
        } catch (ValidationException $exception) {
            throw $exception;
        } catch (Throwable $exception) {
            report($exception);

            return response()->json([
                'message' => 'Failed to place order. Please try again.',
            ], 500);
        }

        return response()->json([
            'message' => 'Order placed successfully! We will contact you shortly.',
            'data' => new OrderResource($order),
        ], 201);
    }

    /**
     * Return only the authenticated customer's own orders.
     */
    public function myOrders(Request $request): JsonResponse
    {
        $orders = Order::query()
            ->whereBelongsTo($request->user())
            ->with(['items', 'shippingAddress', 'billingAddress'])
            ->latest()
            ->get();

        return response()->json([
            'status' => 'success',
            'data' => OrderResource::collection($orders),
        ]);
    }

    public function adminIndex(Request $request): JsonResponse
    {
        $this->authorizeAdmin($request);

        $query = Order::query()
            ->with(['items', 'shippingAddress', 'billingAddress'])
            ->latest();

        if ($request->has('status') && $request->string('status')->value() !== 'all') {
            $query->where('status', $request->string('status')->value());
        }

        return response()->json([
            'status' => 'success',
            'data' => OrderResource::collection($query->get()),
        ]);
    }

    public function adminShow(Request $request, Order $order): JsonResponse
    {
        $this->authorizeAdmin($request);

        return response()->json([
            'status' => 'success',
            'data' => new OrderResource(
                $order->load(['items.product', 'user', 'shippingAddress', 'billingAddress']),
            ),
        ]);
    }

    public function updateStatus(Request $request, Order $order): JsonResponse
    {
        $this->authorizeAdmin($request);

        $validated = $request->validate([
            'status' => ['required', 'in:pending,confirmed,processing,shipped,delivered,cancelled'],
        ]);

        $order->status = $validated['status'];
        $order->save();

        return response()->json([
            'message' => 'Order status updated successfully',
            'data' => new OrderResource(
                $order->load(['items', 'shippingAddress', 'billingAddress']),
            ),
        ]);
    }

    public function destroy(Request $request, Order $order): JsonResponse
    {
        $this->authorizeAdmin($request);

        $order->delete();

        return response()->json([
            'message' => 'Order deleted successfully',
        ]);
    }

    private function authorizeAdmin(Request $request): void
    {
        abort_unless($request->user()?->isAdmin(), 403);
    }
}
