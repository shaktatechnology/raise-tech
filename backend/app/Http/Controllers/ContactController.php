<?php

namespace App\Http\Controllers;

use App\Mail\ContactInquiryMail;
use App\Models\Contact;
use App\Models\Setting;
use App\Models\User;
use App\Services\MailConfigService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Throwable;

class ContactController extends Controller
{
    // Submit contact form (public)
    public function store(Request $request): JsonResponse
    {
        // Invisible honeypot check: automated bots fill out every field in the form
        if ($request->filled('website_url') || $request->filled('company_url')) {
            Log::info('Spam bot trap triggered on contact form from IP: ' . $request->ip());

            return response()->json([
                'message' => 'Thank you for reaching out! Your message has been sent successfully.',
            ], 200);
        }

        $validated = $request->validate([
            'name' => ['required_without:first_name', 'nullable', 'string', 'max:255'],
            'first_name' => ['required_without:name', 'nullable', 'string', 'max:255'],
            'last_name' => ['nullable', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255'],
            'phone' => ['nullable', 'string', 'max:25'],
            'contact_no' => ['nullable', 'string', 'max:25'],
            'subject' => ['nullable', 'string', 'max:255'],
            'message' => ['required', 'string', 'max:5000'],
        ]);

        $firstName = $validated['first_name'] ?? null;
        $lastName = $validated['last_name'] ?? null;

        if (empty($firstName) && !empty($validated['name'])) {
            $parts = explode(' ', trim($validated['name']), 2);
            $firstName = $parts[0];
            $lastName = $parts[1] ?? $lastName;
        }

        // Strip CR/LF to prevent header injection
        $firstName = trim(str_replace(["\r", "\n", "%0a", "%0d"], '', (string) $firstName));
        $lastName = $lastName !== null ? trim(str_replace(["\r", "\n", "%0a", "%0d"], '', (string) $lastName)) : null;
        $contactNo = $validated['contact_no'] ?? ($validated['phone'] ?? null);
        if ($contactNo !== null) {
            $contactNo = trim(str_replace(["\r", "\n", "%0a", "%0d"], '', (string) $contactNo));
        }
        $subject = isset($validated['subject']) ? trim(str_replace(["\r", "\n", "%0a", "%0d"], '', (string) $validated['subject'])) : null;
        $email = trim(str_replace(["\r", "\n", "%0a", "%0d"], '', (string) $validated['email']));
        $message = trim((string) $validated['message']);

        // Prevent duplicate submissions caused by repeatedly clicking submit button
        $existing = Contact::where('email', $email)
            ->where('message', $message)
            ->where('created_at', '>=', now()->subSeconds(30))
            ->first();

        if ($existing) {
            return response()->json([
                'message' => 'Thank you for reaching out! Your message has been sent successfully.',
                'contact' => $existing,
            ], 200);
        }

        // Persist contact inquiry in database transaction
        $contact = DB::transaction(function () use ($firstName, $lastName, $email, $contactNo, $subject, $message) {
            return Contact::create([
                'first_name' => $firstName,
                'last_name' => $lastName,
                'email' => $email,
                'contact_no' => $contactNo ?: '',
                'subject' => $subject,
                'message' => $message,
            ]);
        });

        // Forward inquiry to admin email if notification is enabled
        try {
            $setting = Setting::first();
            $isNotificationEnabled = $setting ? (bool) ($setting->is_inquiry_notification_enabled ?? true) : true;

            if ($isNotificationEnabled) {
                MailConfigService::apply($setting);

                $recipientEmail = !empty($setting?->inquiry_recipient_email)
                    ? $setting->inquiry_recipient_email
                    : (config('mail.to_address')
                    ?: (config('mail.admin_email')
                    ?: ($setting?->email1
                    ?: (User::where('role', 'admin')->value('email')
                    ?: config('mail.from.address')))));

                if (!empty($recipientEmail) && filter_var($recipientEmail, FILTER_VALIDATE_EMAIL)) {
                    Mail::to($recipientEmail)->send(new ContactInquiryMail($contact));
                }
            }
        } catch (Throwable $e) {
            Log::error('Failed to send contact inquiry notification email: ' . $e->getMessage(), [
                'exception' => $e,
                'contact_id' => $contact->id,
            ]);

            return response()->json([
                'message' => 'Unable to send message at this time. Please try again later or contact us directly.',
            ], 500);
        }

        return response()->json([
            'message' => 'Thank you for reaching out! Your message has been sent successfully.',
            'contact' => $contact,
        ], 201);
    }

    // Get all inquiries (admin only)
    public function index(): JsonResponse
    {
        $contacts = Contact::latest()->get();

        return response()->json([
            'contacts' => $contacts,
        ]);
    }

    // Delete inquiry (admin only)
    public function destroy(Contact $contact): JsonResponse
    {
        $contact->delete();

        return response()->json([
            'message' => 'Inquiry deleted successfully.',
        ]);
    }

    // Mark as read (admin only)
    public function markAsRead(Contact $contact): JsonResponse
    {
        $contact->update([
            'is_read' => true,
        ]);

        return response()->json([
            'message' => 'Inquiry marked as read.',
            'contact' => $contact,
        ]);
    }

    // Mark as unread (admin only)
    public function markAsUnread(Contact $contact): JsonResponse
    {
        $contact->update([
            'is_read' => false,
        ]);

        return response()->json([
            'message' => 'Inquiry marked as unread.',
            'contact' => $contact,
        ]);
    }

    // Toggle read/unread status (admin only)
    public function toggleStatus(Contact $contact): JsonResponse
    {
        $newStatus = !$contact->is_read;
        $contact->update([
            'is_read' => $newStatus,
        ]);

        return response()->json([
            'message' => $newStatus ? 'Inquiry marked as read.' : 'Inquiry marked as unread.',
            'contact' => $contact,
        ]);
    }

    // Get unread count (admin only)
    public function unreadCount(): JsonResponse
    {
        $count = Contact::where('is_read', false)->count();

        return response()->json([
            'unread_count' => $count,
        ]);
    }

    // Get notification settings (admin only)
    public function getNotificationSettings(): JsonResponse
    {
        $setting = Setting::first();
        $adminUser = User::where('role', 'admin')->first();

        $recipientEmail = $setting?->inquiry_recipient_email
            ?: (config('mail.to_address')
            ?: (config('mail.admin_email')
            ?: ($setting?->email1
            ?: ($adminUser?->email ?? ''))));

        $isEnabled = $setting ? (bool) ($setting->is_inquiry_notification_enabled ?? true) : true;

        return response()->json([
            'recipient_email' => $recipientEmail,
            'is_enabled' => $isEnabled,
            'reply_to_email' => $setting?->reply_to_email ?? '',
            'sender_name' => $setting?->sender_name ?? '',
            'env_admin_email' => config('mail.to_address') ?: (config('mail.admin_email') ?? ''),
            'mailer' => config('mail.default'),
        ]);
    }

    // Update notification settings (admin only)
    public function updateNotificationSettings(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'recipient_email' => 'required|email|max:255',
            'is_enabled' => 'required|boolean',
            'reply_to_email' => 'nullable|email|max:255',
            'sender_name' => 'nullable|string|max:255',
        ]);

        $setting = Setting::first() ?? Setting::create();
        $setting->inquiry_recipient_email = $validated['recipient_email'];
        $setting->is_inquiry_notification_enabled = $validated['is_enabled'];
        if (array_key_exists('reply_to_email', $validated)) {
            $setting->reply_to_email = $validated['reply_to_email'];
        }
        if (array_key_exists('sender_name', $validated)) {
            $setting->sender_name = $validated['sender_name'];
        }
        $setting->save();

        return response()->json([
            'message' => 'Notification email settings saved successfully.',
            'settings' => [
                'recipient_email' => $setting->inquiry_recipient_email,
                'is_enabled' => (bool) $setting->is_inquiry_notification_enabled,
                'reply_to_email' => $setting->reply_to_email,
                'sender_name' => $setting->sender_name,
            ],
        ]);
    }

    // Send a test notification email (admin only)
    public function sendTestNotification(Request $request): JsonResponse
    {
        $setting = Setting::first();
        MailConfigService::apply($setting);
        $adminUser = User::where('role', 'admin')->first();

        $targetEmail = $request->input('recipient_email')
            ?: ($setting?->inquiry_recipient_email
            ?: (config('mail.to_address')
            ?: (config('mail.admin_email')
            ?: ($setting?->email1
            ?: ($adminUser?->email ?? '')))));

        if (empty($targetEmail) || !filter_var($targetEmail, FILTER_VALIDATE_EMAIL)) {
            return response()->json([
                'message' => 'Please provide or configure a valid email address first.',
            ], 422);
        }

        $mockContact = new Contact([
            'first_name' => 'Admin Test',
            'last_name' => 'Verification',
            'email' => $setting?->reply_to_email ?: 'inquiry-test@raisetech.com.np',
            'contact_no' => '+977-9800000000',
            'subject' => 'SMTP Notification Test Verification - ' . config('app.name', 'Raise Tech'),
            'message' => 'This is a test notification from the Admin panel to verify that email forwarding is functioning properly.',
        ]);

        try {
            Mail::to($targetEmail)->send(new ContactInquiryMail($mockContact));

            return response()->json([
                'message' => "Test email successfully sent to {$targetEmail}!",
            ]);
        } catch (Throwable $e) {
            Log::error('Test inquiry notification email failed: ' . $e->getMessage(), [
                'exception' => $e,
                'target' => $targetEmail,
            ]);

            return response()->json([
                'message' => 'Failed to send test email. Please check your mail configuration.',
            ], 500);
        }
    }
}
