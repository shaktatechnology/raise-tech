<?php

namespace App\Http\Controllers;

use App\Http\Resources\UserAddressResource;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CheckoutProfileController extends Controller
{
    public function show(Request $request): JsonResponse
    {
        $user = $request->user();
        $addresses = $user->addresses()
            ->where('is_default', true)
            ->get()
            ->keyBy('type');

        return response()->json([
            'data' => [
                'user' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'phone' => $user->phone,
                ],
                'shipping_address' => $addresses->has('shipping')
                    ? new UserAddressResource($addresses->get('shipping'))
                    : null,
                'billing_address' => $addresses->has('billing')
                    ? new UserAddressResource($addresses->get('billing'))
                    : null,
            ],
        ]);
    }
}
