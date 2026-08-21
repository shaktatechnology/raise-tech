<?php

namespace App\Http\Controllers;

use App\Http\Requests\UpdateSettingsRequest;
use App\Models\Setting;
use App\Services\ManagedImageStorage;
use Dedoc\Scramble\Attributes\Response as ApiResponse;

class SettingController extends Controller
{
    // get settings public
    public function index()
    {
        $setting = Setting::first() ?? Setting::create([
            'standard_delivery_charge' => 100.00,
            'express_delivery_charge' => 250.00,
        ]);

        return response()->json([
            'setting' => $setting,
        ]);
    }

    // update setting admin only
    #[ApiResponse(403, 'Administrator authorization is required.')]
    public function update(UpdateSettingsRequest $request, ManagedImageStorage $images)
    {
        $setting = Setting::first() ?? Setting::create([
            'standard_delivery_charge' => 100.00,
            'express_delivery_charge' => 250.00,
        ]);
        $setting->fill($request->safe()->except([
            'logo',
            'favicon',
            'remove_logo',
            'remove_favicon',
        ]));
        $images->saveMany($setting, [
            [
                'attribute' => 'logo',
                'replacement' => $request->file('logo'),
                'remove' => $request->boolean('remove_logo'),
                'directory' => 'settings',
            ],
            [
                'attribute' => 'favicon',
                'replacement' => $request->file('favicon'),
                'remove' => $request->boolean('remove_favicon'),
                'directory' => 'settings',
            ],
        ]);
        $setting->refresh();

        return response()->json([
            'message' => 'Settings updated successfully.',
            'setting' => $setting,
        ]);
    }
}
