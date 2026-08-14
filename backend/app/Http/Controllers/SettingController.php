<?php

namespace App\Http\Controllers;

use App\Models\Setting;
use Illuminate\Http\Request;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

class SettingController extends Controller
{
    // get settings public
    public function index()
    {
        $setting = Setting::first() ?? new Setting();

        return response()->json([
            'setting' => $setting,
        ]);
    }

    // update setting admin only
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
            'phone1' => 'nullable|string|max:25',
            'phone2' => 'nullable|string|max:25',
            'email1' => 'nullable|email|max:255',
            'email2' => 'nullable|email|max:255',
            'location' => 'nullable|string|max:500',
            'map_url' => 'nullable|url',
            'logo' => 'nullable',
            'favicon' => 'nullable',
        ]);

        $setting = Setting::firstOrCreate(['id' => 1]);

        $updates = $validated;

        if ($request->has('is_cod_enabled')) {
            $updates['is_cod_enabled'] = filter_var($request->input('is_cod_enabled'), FILTER_VALIDATE_BOOLEAN);
        }

        if ($request->hasFile('logo')) {
            $request->validate([
                'logo' => 'image|mimes:jpeg,png,jpg,gif,svg,webp|max:5120',
            ]);
            $updates['logo'] = $this->storeSettingImage($request->file('logo'), $setting->logo);
        } elseif ($request->has('logo') && !is_file($request->logo)) {
            $updates['logo'] = $request->logo;
        }

        if ($request->hasFile('favicon')) {
            $request->validate([
                'favicon' => 'image|mimes:ico,png,jpg,jpeg,svg,webp|max:2048',
            ]);
            $updates['favicon'] = $this->storeSettingImage($request->file('favicon'), $setting->favicon);
        } elseif ($request->has('favicon') && !is_file($request->favicon)) {
            $updates['favicon'] = $request->favicon;
        }

        $setting->update($updates);

        return response()->json([
            'message' => 'Settings updated successfully.',
            'setting' => $setting->fresh(),
        ]);
    }

    /**
     * Store uploaded setting image on the public disk and remove previous image if applicable.
     */
    private function storeSettingImage(UploadedFile $file, ?string $existingPath): string
    {
        if ($existingPath && !str_starts_with($existingPath, 'http')) {
            $relativePath = ltrim(str_replace('/storage/', '', $existingPath), '/');
            if (Storage::disk('public')->exists($relativePath)) {
                Storage::disk('public')->delete($relativePath);
            }
        }

        $storedPath = $file->store('settings', 'public');

        return '/storage/' . $storedPath;
    }
}
