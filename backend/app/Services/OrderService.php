<?php

namespace App\Services;

use App\Models\Order;
use App\Models\Product;
use App\Models\Setting;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class OrderService
{
    /**
     * @param  array<string, mixed>  $data
     */
    public function create(array $data, ?User $user = null): Order
    {
        return DB::transaction(function () use ($data, $user): Order {
            $productIds = collect($data['items'])
                ->pluck('product_id')
                ->unique()
                ->sort()
                ->values();

            $products = Product::query()
                ->whereKey($productIds)
                ->lockForUpdate()
                ->get()
                ->keyBy('id');

            $subtotal = 0.0;
            $orderItems = [];

            foreach ($data['items'] as $index => $item) {
                /** @var Product|null $product */
                $product = $products->get($item['product_id']);

                if ($product === null) {
                    throw ValidationException::withMessages([
                        "items.{$index}.product_id" => 'The selected product is no longer available.',
                    ]);
                }

                if (! $product->is_active) {
                    throw ValidationException::withMessages([
                        "items.{$index}.product_id" => "Product '{$product->title}' is not available.",
                    ]);
                }

                if ($product->stock_quantity < $item['quantity']) {
                    throw ValidationException::withMessages([
                        "items.{$index}.quantity" => "Insufficient stock for '{$product->title}'. Available: {$product->stock_quantity}.",
                    ]);
                }

                $unitPrice = $this->effectivePrice($product);
                $itemSubtotal = round($unitPrice * $item['quantity'], 2);
                $subtotal = round($subtotal + $itemSubtotal, 2);

                $orderItems[] = [
                    'product_id' => $product->id,
                    'product_title' => $product->title,
                    'product_sku' => $product->sku,
                    'unit_price' => $unitPrice,
                    'quantity' => $item['quantity'],
                    'subtotal' => $itemSubtotal,
                ];
            }

            $setting = Setting::first();
            $standardFee = (float) ($setting?->standard_delivery_charge ?? 100.0);
            $expressFee = (float) ($setting?->express_delivery_charge ?? 250.0);
            $shippingCharges = [
                'standard' => $standardFee,
                'express' => $expressFee,
            ];
            $shippingCharge = $shippingCharges[$data['delivery_type']] ?? $standardFee;

            $order = new Order([
                'customer_name' => $data['customer_name'],
                'customer_email' => $data['customer_email'],
                'customer_phone' => $data['customer_phone'],
                'payment_method' => $data['payment_method'],
                'delivery_type' => $data['delivery_type'],
                'notes' => $data['notes'] ?? null,
            ]);
            $order->user()->associate($user);
            $order->status = 'pending';
            $order->subtotal = $subtotal;
            $order->shipping_charge = $shippingCharge;
            $order->total = round($subtotal + $shippingCharge, 2);
            $order->save();

            foreach ($orderItems as $index => $orderItem) {
                $order->items()->create($orderItem);

                /** @var Product $product */
                $product = $products->get($data['items'][$index]['product_id']);
                $product->stock_quantity -= $orderItem['quantity'];
                $product->sold_count += $orderItem['quantity'];
                $product->save();
            }

            $shippingAddress = $data['shipping_address'];
            $billingAddress = $data['billing_same_as_shipping']
                ? $shippingAddress
                : $data['billing_address'];

            $order->shippingAddress()->create($shippingAddress);
            $order->billingAddress()->create($billingAddress);

            if ($user !== null) {
                if ($data['save_for_future'] ?? false) {
                    $this->saveCheckoutDetails(
                        $user,
                        $shippingAddress,
                        $billingAddress,
                        $data['billing_same_as_shipping'],
                    );
                }

                $cart = $user->cart()->lockForUpdate()->first();
                $cart?->items()->delete();
            }

            return $order->load(['items', 'shippingAddress', 'billingAddress']);
        }, 3);
    }

    /**
     * @param  array<string, string>  $shippingAddress
     * @param  array<string, string>  $billingAddress
     */
    private function saveCheckoutDetails(
        User $user,
        array $shippingAddress,
        array $billingAddress,
        bool $billingSameAsShipping,
    ): void {
        $user->forceFill([
            'phone' => $shippingAddress['phone_number'],
        ])->save();

        $addresses = ['shipping' => $shippingAddress];

        if ($billingSameAsShipping) {
            $user->addresses()->where('type', 'billing')->delete();
        } else {
            $addresses['billing'] = $billingAddress;
        }

        foreach ($addresses as $type => $address) {
            $user->addresses()->updateOrCreate(
                ['type' => $type],
                [
                    'label' => 'Checkout',
                    'name' => $address['name'],
                    'phone_number' => $address['phone_number'],
                    'address' => $address['address'],
                    'city' => $address['city'],
                    'province' => $address['province'],
                    'is_default' => true,
                ],
            );
        }
    }

    private function effectivePrice(Product $product): float
    {
        $price = (float) $product->original_price;
        $discountValue = (float) $product->discount_value;

        if ($product->discount_type === 'percentage' && $discountValue > 0) {
            return round(max(0, $price - ($price * $discountValue / 100)), 2);
        }

        if ($product->discount_type === 'fixed' && $discountValue > 0) {
            return round(max(0, $price - $discountValue), 2);
        }

        return round($price, 2);
    }
}
