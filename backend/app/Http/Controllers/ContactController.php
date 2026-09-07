<?php

namespace App\Http\Controllers;

use App\Mail\ContactInquiryMail;
use App\Models\Contact;
use App\Models\Setting;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Schema;

class ContactController extends Controller
{
    // Submit contact form (public)
    public function store(Request $request)
    {
        $validated = $request->validate([
            'first_name' => 'required|string|max:255',
            'last_name' => 'required|string|max:255',
            'email' => 'required|email|max:255',
            'contact_no' => 'required|string|max:15',
            'message' => 'required|string|max:2000',
        ]);

        $contact = Contact::create($validated);

        // Forward inquiry to admin's email if notification is enabled
        try {
            $setting = Setting::first();
            $isNotificationEnabled = $setting ? (bool) ($setting->is_inquiry_notification_enabled ?? true) : true;

            if ($isNotificationEnabled) {
                $adminEmail = $setting?->inquiry_recipient_email
                    ?: (config('mail.admin_email')
                    ?: ($setting?->email1
                    ?: (User::where('role', 'admin')->value('email')
                    ?: config('mail.from.address'))));

                if (!empty($adminEmail)) {
                    Mail::to($adminEmail)->send(new ContactInquiryMail($contact));
                }
            }
        } catch (\Throwable $e) {
            Log::error('Failed to send contact inquiry notification email: ' . $e->getMessage());
        }

        return response()->json([
            'message' => 'Thank you for reaching out ! Your message has been sent successfully.',
            'contact' => $contact,
        ], 201);
    }

    // Get all inquiries (admin only)
    public function index()
    {
        $contacts = Contact::latest()->get();

        return response()->json([
            'contacts' => $contacts,
        ]);
    }

    // Delete inquiry (admin only)
    public function destroy(Contact $contact)
    {
        $contact->delete();

        return response()->json([
            'message' => 'Inquiry deleted successfully.',
        ]);
    }

    // Mark as read (admin only)
    public function markAsRead(Contact $contact)
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
    public function markAsUnread(Contact $contact)
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
    public function toggleStatus(Contact $contact)
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
    public function unreadCount()
    {
        $count = Contact::where('is_read', false)->count();

        return response()->json([
            'unread_count' => $count,
        ]);
    }

    // Get notification settings (admin only)
    public function getNotificationSettings()
    {
        $this->ensureNotificationColumnsExist();

        $setting = Setting::first();
        $adminUser = User::where('role', 'admin')->first();

        $recipientEmail = $setting?->inquiry_recipient_email
            ?: (config('mail.admin_email')
            ?: ($setting?->email1
            ?: ($adminUser?->email ?? '')));

        $isEnabled = $setting ? (bool) ($setting->is_inquiry_notification_enabled ?? true) : true;

        return response()->json([
            'recipient_email' => $recipientEmail,
            'is_enabled' => $isEnabled,
            'env_admin_email' => config('mail.admin_email') ?? '',
            'mailer' => config('mail.default'),
        ]);
    }

    // Update notification settings (admin only)
    public function updateNotificationSettings(Request $request)
    {
        $this->ensureNotificationColumnsExist();

        $validated = $request->validate([
            'recipient_email' => 'required|email|max:255',
            'is_enabled' => 'required|boolean',
        ]);

        $setting = Setting::first() ?? Setting::create();
        $setting->inquiry_recipient_email = $validated['recipient_email'];
        $setting->is_inquiry_notification_enabled = $validated['is_enabled'];
        $setting->save();

        return response()->json([
            'message' => 'Notification email settings saved successfully.',
            'settings' => [
                'recipient_email' => $setting->inquiry_recipient_email,
                'is_enabled' => (bool) $setting->is_inquiry_notification_enabled,
            ],
        ]);
    }

    // Send a test notification email (admin only)
    public function sendTestNotification(Request $request)
    {
        $this->ensureNotificationColumnsExist();

        $setting = Setting::first();
        $adminUser = User::where('role', 'admin')->first();

        $targetEmail = $request->input('recipient_email')
            ?: ($setting?->inquiry_recipient_email
            ?: (config('mail.admin_email')
            ?: ($setting?->email1
            ?: ($adminUser?->email ?? ''))));

        if (empty($targetEmail) || !filter_var($targetEmail, FILTER_VALIDATE_EMAIL)) {
            return response()->json([
                'message' => 'Please provide or configure a valid email address first.',
            ], 422);
        }

        $mockContact = new Contact([
            'first_name' => 'Admin Test',
            'last_name' => 'Verification',
            'email' => 'inquiry-test@raisetech.com.np',
            'contact_no' => '+977-9800000000',
            'message' => 'This is a test notification from the Admin Inquiries panel to verify that email forwarding to your Gmail inbox is functioning properly.',
        ]);

        try {
            Mail::to($targetEmail)->send(new ContactInquiryMail($mockContact));

            return response()->json([
                'message' => "Test email successfully sent to {$targetEmail}!",
            ]);
        } catch (\Throwable $e) {
            Log::error('Test inquiry notification email failed: ' . $e->getMessage());

            return response()->json([
                'message' => 'Failed to send email: ' . $e->getMessage(),
            ], 500);
        }
    }

    // Self-healing check for settings table columns
    private function ensureNotificationColumnsExist(): void
    {
        try {
            if (!Schema::hasColumn('settings', 'inquiry_recipient_email') || !Schema::hasColumn('settings', 'is_inquiry_notification_enabled')) {
                Schema::table('settings', function ($table) {
                    if (!Schema::hasColumn('settings', 'inquiry_recipient_email')) {
                        $table->string('inquiry_recipient_email')->nullable();
                    }
                    if (!Schema::hasColumn('settings', 'is_inquiry_notification_enabled')) {
                        $table->boolean('is_inquiry_notification_enabled')->default(true);
                    }
                });
            }
        } catch (\Throwable $e) {
            Log::warning('Could not automatically alter settings table: ' . $e->getMessage());
        }
    }
}
