<?php

namespace App\Http\Controllers;

use App\Http\Requests\UpdateSettingsRequest;
use App\Mail\ContactInquiryMail;
use App\Models\Contact;
use App\Models\Setting;
use App\Services\MailConfigService;
use App\Services\ManagedImageStorage;
use Dedoc\Scramble\Attributes\Response as ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Crypt;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Throwable;

class SettingController extends Controller
{
    // get settings public
    public function index(): JsonResponse
    {
        $setting = Setting::first() ?? Setting::create([
            'is_standard_delivery_enabled' => true,
            'is_express_delivery_enabled' => true,
            'standard_delivery_charge' => 100.00,
            'express_delivery_charge' => 250.00,
            'is_inquiry_notification_enabled' => true,
        ]);

        if (empty($setting->google_client_id)) {
            $envClientId = env('GOOGLE_CLIENT_ID');
            if ($envClientId) {
                $setting->google_client_id = trim($envClientId);
            }
        }

        return response()->json([
            'setting' => $setting,
        ]);
    }

    // update setting admin only
    #[ApiResponse(403, 'Administrator authorization is required.')]
    public function update(UpdateSettingsRequest $request, ManagedImageStorage $images): JsonResponse
    {
        $setting = DB::transaction(function () use ($request, $images) {
            $setting = Setting::first() ?? Setting::create([
                'is_standard_delivery_enabled' => true,
                'is_express_delivery_enabled' => true,
                'standard_delivery_charge' => 100.00,
                'express_delivery_charge' => 250.00,
                'is_inquiry_notification_enabled' => true,
            ]);

            $setting->fill($request->safe()->except([
                'logo',
                'favicon',
                'remove_logo',
                'remove_favicon',
                'mail_password',
                'remove_mail_password',
                'google_client_secret',
                'remove_google_client_secret',
            ]));

            if ($request->filled('mail_password')) {
                $setting->mail_password = Crypt::encryptString($request->input('mail_password'));
            } elseif ($request->boolean('remove_mail_password')) {
                $setting->mail_password = null;
            }

            if ($request->filled('google_client_secret')) {
                $setting->google_client_secret = Crypt::encryptString($request->input('google_client_secret'));
            } elseif ($request->boolean('remove_google_client_secret')) {
                $setting->google_client_secret = null;
            }

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

            $setting->save();
            $setting->refresh();

            return $setting;
        });

        MailConfigService::apply($setting);

        return response()->json([
            'message' => 'Settings updated successfully.',
            'setting' => $setting,
        ]);
    }

    // send test email admin only
    #[ApiResponse(403, 'Administrator authorization is required.')]
    public function sendTestEmail(Request $request): JsonResponse
    {
        $request->validate([
            'recipient_email' => ['nullable', 'email', 'max:255'],
        ]);

        $setting = Setting::first();
        MailConfigService::apply($setting);

        $targetEmail = $request->input('recipient_email')
            ?: ($setting?->inquiry_recipient_email
            ?: (config('mail.to_address')
            ?: (config('mail.admin_email')
            ?: ($setting?->email1
            ?: config('mail.from.address')))));

        if (empty($targetEmail) || !filter_var($targetEmail, FILTER_VALIDATE_EMAIL)) {
            return response()->json([
                'message' => 'Please provide or configure a valid recipient email address first.',
            ], 422);
        }

        $testContact = new Contact([
            'first_name' => 'Admin Test',
            'last_name' => 'Verification',
            'email' => $setting?->reply_to_email ?: 'test@raisetech.com.np',
            'contact_no' => '+977-9800000000',
            'subject' => 'SMTP Test Verification - ' . config('app.name', 'Raise Tech'),
            'message' => 'This is a test notification to verify that SMTP email delivery and the configured recipient email address are functioning properly.',
        ]);

        try {
            Mail::to($targetEmail)->send(new ContactInquiryMail($testContact));

            return response()->json([
                'message' => "Test email successfully sent to {$targetEmail}!",
            ]);
        } catch (Throwable $e) {
            Log::error('SMTP test email delivery failed: ' . $e->getMessage(), [
                'exception' => $e,
                'target' => $targetEmail,
            ]);

            return response()->json([
                'message' => 'Failed to send test email. Please check your mail configuration.',
            ], 500);
        }
    }
}
