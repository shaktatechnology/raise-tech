<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Setting;

class SettingController extends Controller
{
    //get settigs public
    public function index()
    {
        $setting = Setting::first() ?? new Setting();

        return response()->json([
            'setting' => $setting,
        ]);
    }

    //update setting admin only
    public function update(Request $request)
    {
        $validated = $request->validate([
            'short_description' => 'nullable|string',
            'facebook_url' => 'nullable|url',
            'twitter_url' => 'nullable|url',
            'instagram_url' => 'nullable|url',
            'linkedin_url' => 'nullable|url',
            'tiktok_url' => 'nullable|url',
            'whatsapp_url' => 'nullable|url',
            'phone1' => 'nullable|string|max:15',
            'phone2' => 'nullable|string|max:15',
            'email1' => 'nullable|email|max:255',
            'email2' => 'nullable|email|max:255',
            'location' => 'nullable|string|max:500',
            'map_url' => 'nullable|url',
            'is_cod_enabled' => 'nullable|boolean',
            'payment_methods' => 'nullable|array',
        ]);

        $setting = Setting::first();

        if (!$setting) {
            $setting = Setting::create($validated);
        } else {
            $setting->update($validated);
        }

        return response()->json([
            'message' => 'Settings updated successfully.',
            'setting' => $setting,
        ]);
    }
}
