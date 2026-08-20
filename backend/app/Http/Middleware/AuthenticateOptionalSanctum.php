<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class AuthenticateOptionalSanctum
{
    public function handle(Request $request, Closure $next): Response|JsonResponse
    {
        if ($request->bearerToken() !== null && $request->user('sanctum') === null) {
            return response()->json([
                'message' => 'Your session has expired. Please sign in again before checking out.',
            ], 401);
        }

        return $next($request);
    }
}
