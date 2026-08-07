<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
    //customer registration only not for the admin
    public function register(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users,email',
            'phone' => 'nullable|string|max:20',
            'password' => 'required|string|min:8|confirmed',
        ]);

        //role is strictrly forced to 'customer'
        $user = User::create([
            'name'=> $validated['name'],
            'email'=> $validated['email'],
            'phone' => $validated['phone']?? null,
            'password'=> Hash::make($validated['password']),
            'role'=> 'customer',
            'status' => 'active',
        ]);

        event(new Registered($user));

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'message' => 'Registration successful.Please verify your email.',
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'phone' => $user->phone,
                'role' => $user->role,
                'status' => $user->status,
                'email_verified_at' => $user->email_verified_at,
            ],
            'access_token' => $token,
            'token_type' => 'Bearer',
        ], 201);
    }  
    //Single login endpoint for admin and customer

        public function login(Request $request)
        {
            $validated = $request->validate([
                'email' => 'required|string|email',
                'password' => 'required|string',
            ]);

            $user = User::where('email', $validated['email'])->first();

            if (!$user || !Hash::check($validated['password'], $user->password)) {
                return response()->json([
                    'message' => 'Invalid email or password.',
                ], 401);
            }
            $token = $user->createToken('auth_token')->plainTextToken;

            return response()->json([
                'message' => 'Login successful.',
                'user' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'phone' => $user->phone,
                    'role' => $user->role,
                    'status' => $user->status,
                    'email_verified_at' => $user->email_verified_at,
                ],
                'access_token' => $token,
                'token_type' => 'Bearer',
            ]);
        }

        public function me(Request $request)
        {
            return response()->json([
                'user' => $request->user(),
            ]);
        }

        public function logout(Request $request)
        {
            $request->user()->currentAccessToken()->delete();

            return response()->json([
                'message' => 'Logged out successfully.',
            ]);
        }

        public function googleLogin(Request $request)
        {
            $validated = $request->validate([
                'token' => 'required|string',
            ]);

            // Verify Google token via Google OAuth2 tokeninfo endpoint
            $response = \Illuminate\Support\Facades\Http::get('https://oauth2.googleapis.com/tokeninfo', [
                'id_token' => $validated['token'],
            ]);

            if (!$response->successful()) {
                return response()->json([
                    'message' => 'Invalid Google token.',
                ], 401);
            }

            $googleUser = $response->json();
            $email = $googleUser['email'] ?? null;
            $name = $googleUser['name'] ?? 'Google User';

            if (!$email) {
                return response()->json([
                    'message' => 'Unable to retrieve email from Google token.',
                ], 422);
            }

            // Find existing user or register new customer
            $user = User::where('email', $email)->first();

            if (!$user) {
                $user = User::create([
                    'name' => $name,
                    'email' => $email,
                    'phone' => null,
                    'password' => \Illuminate\Support\Facades\Hash::make(\Illuminate\Support\Str::random(24)),
                    'role' => 'customer',
                    'status' => 'active',
                    'email_verified_at' => now(),
                ]);
            }

            $token = $user->createToken('auth_token')->plainTextToken;

            return response()->json([
                'message' => 'Google login successful.',
                'user' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'phone' => $user->phone,
                    'role' => $user->role,
                    'status' => $user->status,
                    'email_verified_at' => $user->email_verified_at,
                ],
                'access_token' => $token,
                'token_type' => 'Bearer',
            ]);
        }
}

