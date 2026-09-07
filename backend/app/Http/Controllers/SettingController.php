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
        $this->ensureContactColumnsExist();

        $setting = Setting::first() ?? Setting::create([
            'is_standard_delivery_enabled' => true,
            'is_express_delivery_enabled' => true,
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
            'is_standard_delivery_enabled' => true,
            'is_express_delivery_enabled' => true,
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

    private function ensureContactColumnsExist(): void
    {
        try {
            $cols = [
                'company_name' => 'string',
                'contact_eyebrow' => 'string',
                'contact_title' => 'string',
                'contact_description' => 'text',
                'operating_hours' => 'string',
                'operating_hours_note' => 'string',
                'inquiry_recipient_email' => 'string',
                'is_inquiry_notification_enabled' => 'boolean',
            ];

            $missing = [];
            foreach ($cols as $name => $type) {
                if (!\Illuminate\Support\Facades\Schema::hasColumn('settings', $name)) {
                    $missing[$name] = $type;
                }
            }

            if (!empty($missing)) {
                \Illuminate\Support\Facades\Schema::table('settings', function ($table) use ($missing) {
                    foreach ($missing as $col => $type) {
                        if ($type === 'text') {
                            $table->text($col)->nullable();
                        } elseif ($type === 'boolean') {
                            $table->boolean($col)->default(true);
                        } else {
                            $table->string($col)->nullable();
                        }
                    }
                });
            }
        } catch (\Throwable $e) {
            \Illuminate\Support\Facades\Log::warning('Settings column check: ' . $e->getMessage());
        }
    }
}
