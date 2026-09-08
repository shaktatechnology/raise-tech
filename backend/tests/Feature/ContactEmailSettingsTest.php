<?php

namespace Tests\Feature;

use App\Mail\ContactInquiryMail;
use App\Models\Contact;
use App\Models\Setting;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Routing\Middleware\ThrottleRequests;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\Crypt;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Mail;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class ContactEmailSettingsTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_can_update_contact_settings(): void
    {
        $this->actingAsAdmin();

        $response = $this->postJson('/api/settings', [
            'inquiry_recipient_email' => 'notifications@raisetech.com.np',
            'is_inquiry_notification_enabled' => true,
            'reply_to_email' => 'support@raisetech.com.np',
            'sender_name' => 'Raise Tech Notifications',
            'email1' => 'contact@raisetech.com.np',
            'email2' => 'secondary@raisetech.com.np',
            'phone1' => '+977-9844702792',
            'phone2' => '015705475',
            'location' => 'New Road, Kathmandu, Nepal',
        ]);

        $response->assertOk()
            ->assertJsonPath('message', 'Settings updated successfully.')
            ->assertJsonPath('setting.inquiry_recipient_email', 'notifications@raisetech.com.np')
            ->assertJsonPath('setting.reply_to_email', 'support@raisetech.com.np')
            ->assertJsonPath('setting.sender_name', 'Raise Tech Notifications')
            ->assertJsonPath('setting.email1', 'contact@raisetech.com.np')
            ->assertJsonPath('setting.phone1', '+977-9844702792')
            ->assertJsonPath('setting.location', 'New Road, Kathmandu, Nepal')
            ->assertJsonPath('setting.is_inquiry_notification_enabled', true);

        $this->assertDatabaseHas('settings', [
            'inquiry_recipient_email' => 'notifications@raisetech.com.np',
            'reply_to_email' => 'support@raisetech.com.np',
            'sender_name' => 'Raise Tech Notifications',
            'email1' => 'contact@raisetech.com.np',
            'phone1' => '+977-9844702792',
            'location' => 'New Road, Kathmandu, Nepal',
        ]);
    }

    public function test_non_admin_users_cannot_update_settings(): void
    {
        Sanctum::actingAs(User::factory()->create(['role' => 'customer']));

        $this->postJson('/api/settings', [
            'inquiry_recipient_email' => 'hacked@example.com',
        ])->assertForbidden();

        $this->postJson('/api/settings/test-email', [
            'recipient_email' => 'hacked@example.com',
        ])->assertForbidden();

        $this->postJson('/api/inquiries/notification-settings', [
            'recipient_email' => 'hacked@example.com',
            'is_enabled' => true,
        ])->assertForbidden();

        $this->getJson('/api/inquiries')->assertForbidden();
    }

    public function test_unauthenticated_users_cannot_access_admin_settings_operations(): void
    {
        $this->postJson('/api/settings', [
            'inquiry_recipient_email' => 'anon@example.com',
        ])->assertUnauthorized();

        $this->postJson('/api/settings/test-email', [])->assertUnauthorized();
        $this->postJson('/api/inquiries/test-notification', [])->assertUnauthorized();
        $this->getJson('/api/inquiries')->assertUnauthorized();
        $this->getJson('/api/inquiries/notification-settings')->assertUnauthorized();
        $this->postJson('/api/inquiries/notification-settings', [])->assertUnauthorized();
    }

    public function test_public_contact_form_submission_works(): void
    {
        Mail::fake();

        Setting::create([
            'inquiry_recipient_email' => 'admin@raisetech.com.np',
            'is_inquiry_notification_enabled' => true,
        ]);

        $response = $this->withoutMiddleware(ThrottleRequests::class)->postJson('/api/inquiry', [
            'first_name' => 'John',
            'last_name' => 'Doe',
            'email' => 'johndoe@example.com',
            'contact_no' => '+977-9800000000',
            'subject' => 'Website Inquiry',
            'message' => 'I would like to inquire about software development services.',
        ]);

        $response->assertCreated()
            ->assertJsonPath('contact.first_name', 'John')
            ->assertJsonPath('contact.last_name', 'Doe')
            ->assertJsonPath('contact.email', 'johndoe@example.com')
            ->assertJsonPath('contact.subject', 'Website Inquiry');

        $this->assertDatabaseHas('contacts', [
            'email' => 'johndoe@example.com',
            'first_name' => 'John',
            'subject' => 'Website Inquiry',
        ]);

        Mail::assertSent(ContactInquiryMail::class, function ($mail) {
            return $mail->hasTo('admin@raisetech.com.np');
        });
    }

    public function test_configured_settings_recipient_receives_inquiry(): void
    {
        Mail::fake();

        Setting::create([
            'inquiry_recipient_email' => 'inquiries-manager@raisetech.com.np',
            'is_inquiry_notification_enabled' => true,
        ]);

        Config::set('mail.to_address', 'fallback@raisetech.com.np');

        $this->withoutMiddleware(ThrottleRequests::class)->postJson('/api/inquiry', [
            'first_name' => 'Jane',
            'last_name' => 'Smith',
            'email' => 'jane@example.com',
            'message' => 'Testing configured recipient delivery.',
        ])->assertCreated();

        Mail::assertSent(ContactInquiryMail::class, function ($mail) {
            return $mail->hasTo('inquiries-manager@raisetech.com.np') &&
                   !$mail->hasTo('fallback@raisetech.com.np');
        });
    }

    public function test_mail_to_address_is_used_as_fallback(): void
    {
        Mail::fake();

        Setting::create([
            'inquiry_recipient_email' => null,
            'is_inquiry_notification_enabled' => true,
        ]);

        Config::set('mail.to_address', 'default-admin@raisetech.com.np');

        $this->withoutMiddleware(ThrottleRequests::class)->postJson('/api/inquiry', [
            'name' => 'Robert Johnson',
            'email' => 'robert@example.com',
            'message' => 'Testing fallback recipient routing.',
        ])->assertCreated();

        Mail::assertSent(ContactInquiryMail::class, function ($mail) {
            return $mail->hasTo('default-admin@raisetech.com.np');
        });
    }

    public function test_notifications_are_not_sent_when_disabled(): void
    {
        Mail::fake();

        Setting::create([
            'inquiry_recipient_email' => 'admin@raisetech.com.np',
            'is_inquiry_notification_enabled' => false,
        ]);

        $this->withoutMiddleware(ThrottleRequests::class)->postJson('/api/inquiry', [
            'first_name' => 'Quiet',
            'last_name' => 'Visitor',
            'email' => 'quiet@example.com',
            'message' => 'Testing disabled notifications.',
        ])->assertCreated();

        Mail::assertNothingSent();
    }

    public function test_validation_errors_are_returned_correctly(): void
    {
        $response = $this->withoutMiddleware(ThrottleRequests::class)->postJson('/api/inquiry', [
            'email' => 'invalid-email-string',
            'message' => '',
        ]);

        $response->assertUnprocessable()
            ->assertJsonValidationErrors(['email', 'message']);
    }

    public function test_mail_failure_is_handled_safely(): void
    {
        // Mock Mail to simulate an SMTP connection error that contains a mock password
        Mail::shouldReceive('to')
            ->once()
            ->andReturnSelf();

        Mail::shouldReceive('send')
            ->once()
            ->andThrow(new \Exception('Connection refused: smtp.gmail.com:587 password=supersecretpass'));

        Setting::create([
            'inquiry_recipient_email' => 'admin@raisetech.com.np',
            'is_inquiry_notification_enabled' => true,
        ]);

        $response = $this->withoutMiddleware(ThrottleRequests::class)->postJson('/api/inquiry', [
            'first_name' => 'Failure',
            'last_name' => 'Tester',
            'email' => 'failure@example.com',
            'message' => 'Test safe failure handling.',
        ]);

        $response->assertStatus(500);

        // Ensure the response does not expose SMTP credentials or raw exception trace
        $content = $response->getContent();
        $this->assertStringNotContainsString('supersecretpass', $content);
        $this->assertStringNotContainsString('smtp.gmail.com', $content);
        $this->assertStringNotContainsString('Connection refused', $content);
    }

    public function test_test_email_endpoint_is_admin_protected(): void
    {
        // Unauthenticated
        $this->postJson('/api/settings/test-email', [])->assertUnauthorized();
        $this->postJson('/api/inquiries/test-notification', [])->assertUnauthorized();

        // Customer (non-admin)
        Sanctum::actingAs(User::factory()->create(['role' => 'customer']));
        $this->postJson('/api/settings/test-email', [])->assertForbidden();
        $this->postJson('/api/inquiries/test-notification', [])->assertForbidden();

        // Admin
        $this->actingAsAdmin();
        Mail::fake();

        $response = $this->postJson('/api/settings/test-email', [
            'recipient_email' => 'admin-test@raisetech.com.np',
        ]);

        $response->assertOk()
            ->assertJsonPath('message', 'Test email successfully sent to admin-test@raisetech.com.np!');

        Mail::assertSent(ContactInquiryMail::class, function ($mail) {
            return $mail->hasTo('admin-test@raisetech.com.np');
        });
    }

    public function test_sensitive_smtp_values_are_never_returned_by_the_api(): void
    {
        $this->actingAsAdmin();

        $publicSettingsResponse = $this->getJson('/api/settings')->assertOk();
        $this->assertArrayNotHasKey('mail_password', $publicSettingsResponse->json('setting'));
        $publicContent = $publicSettingsResponse->getContent();

        $this->assertStringNotContainsString('MAIL_PASSWORD', $publicContent);
        $this->assertStringNotContainsString('"mail_password":', $publicContent);
        $this->assertStringNotContainsString('MAIL_USERNAME', $publicContent);

        $adminNotificationSettingsResponse = $this->getJson('/api/inquiries/notification-settings')->assertOk();
        $notifContent = $adminNotificationSettingsResponse->getContent();

        $this->assertStringNotContainsString('MAIL_PASSWORD', $notifContent);
        $this->assertStringNotContainsString('"mail_password":', $notifContent);
        $this->assertStringNotContainsString('MAIL_USERNAME', $notifContent);
    }

    public function test_admin_can_configure_smtp_credentials_and_password_is_encrypted(): void
    {
        $this->actingAsAdmin();

        $response = $this->postJson('/api/settings', [
            'mail_host' => 'smtp.customclient.com',
            'mail_port' => 587,
            'mail_username' => 'client@customclient.com',
            'mail_password' => 'SuperClientPass123!',
            'mail_encryption' => 'tls',
            'mail_from_address' => 'noreply@customclient.com',
            'mail_from_name' => 'Custom Client Mailer',
        ]);

        $response->assertOk()
            ->assertJsonPath('setting.mail_host', 'smtp.customclient.com')
            ->assertJsonPath('setting.mail_port', 587)
            ->assertJsonPath('setting.mail_username', 'client@customclient.com')
            ->assertJsonPath('setting.mail_encryption', 'tls')
            ->assertJsonPath('setting.mail_from_address', 'noreply@customclient.com')
            ->assertJsonPath('setting.mail_from_name', 'Custom Client Mailer')
            ->assertJsonPath('setting.has_mail_password', true);

        // Password MUST NOT be present in response JSON
        $this->assertArrayNotHasKey('mail_password', $response->json('setting'));
        $content = $response->getContent();
        $this->assertStringNotContainsString('SuperClientPass123!', $content);
        $this->assertStringNotContainsString('"mail_password":', $content);

        // Check database: password MUST be stored encrypted, not plaintext
        $dbSetting = Setting::first();
        $this->assertNotEmpty($dbSetting->mail_password);
        $this->assertNotEquals('SuperClientPass123!', $dbSetting->mail_password);
        $this->assertEquals('SuperClientPass123!', \Illuminate\Support\Facades\Crypt::decryptString($dbSetting->mail_password));

        // Public settings API must also never leak the password
        $publicResp = $this->getJson('/api/settings')->assertOk();
        $this->assertArrayNotHasKey('mail_password', $publicResp->json('setting'));
        $this->assertStringNotContainsString('SuperClientPass123!', $publicResp->getContent());
        $this->assertStringNotContainsString('"mail_password":', $publicResp->getContent());
        $publicResp->assertJsonPath('setting.has_mail_password', true);
    }

    public function test_updating_settings_without_password_preserves_existing_encrypted_password(): void
    {
        $this->actingAsAdmin();

        // 1. Initial save with password
        $this->postJson('/api/settings', [
            'mail_host' => 'smtp.initial.com',
            'mail_password' => 'InitialSecretPassword999',
        ])->assertOk();

        $originalEncrypted = Setting::first()->mail_password;
        $this->assertNotEmpty($originalEncrypted);

        // 2. Secondary update without providing mail_password
        $this->postJson('/api/settings', [
            'mail_host' => 'smtp.updated-domain.com',
        ])->assertOk();

        $updatedSetting = Setting::first();
        $this->assertEquals('smtp.updated-domain.com', $updatedSetting->mail_host);
        $this->assertEquals($originalEncrypted, $updatedSetting->mail_password);
        $this->assertEquals('InitialSecretPassword999', \Illuminate\Support\Facades\Crypt::decryptString($updatedSetting->mail_password));
    }

    public function test_admin_can_remove_custom_smtp_password(): void
    {
        $this->actingAsAdmin();

        $this->postJson('/api/settings', [
            'mail_password' => 'TemporaryPassword123',
        ])->assertOk();

        $this->assertTrue(Setting::first()->has_mail_password);

        // Remove custom password
        $response = $this->postJson('/api/settings', [
            'remove_mail_password' => true,
        ])->assertOk();

        $response->assertJsonPath('setting.has_mail_password', false);
        $this->assertNull(Setting::first()->mail_password);
    }

    public function test_mail_config_service_applies_database_smtp_credentials_at_runtime(): void
    {
        $setting = Setting::create([
            'mail_host' => 'smtp.dynamic-test.com',
            'mail_port' => 465,
            'mail_username' => 'dynamic-user@dynamic-test.com',
            'mail_password' => \Illuminate\Support\Facades\Crypt::encryptString('dynamic-pass-456'),
            'mail_encryption' => 'ssl',
            'mail_from_address' => 'sender@dynamic-test.com',
            'mail_from_name' => 'Dynamic Sender',
        ]);

        \App\Services\MailConfigService::apply($setting);

        $this->assertEquals('smtp.dynamic-test.com', config('mail.mailers.smtp.host'));
        $this->assertEquals(465, config('mail.mailers.smtp.port'));
        $this->assertEquals('dynamic-user@dynamic-test.com', config('mail.mailers.smtp.username'));
        $this->assertEquals('dynamic-pass-456', config('mail.mailers.smtp.password'));
        $this->assertEquals('ssl', config('mail.mailers.smtp.encryption'));
        $this->assertEquals('sender@dynamic-test.com', config('mail.from.address'));
        $this->assertEquals('Dynamic Sender', config('mail.from.name'));
    }

    public function test_honeypot_silently_discards_bot_submissions(): void
    {
        Mail::fake();

        $response = $this->withoutMiddleware(ThrottleRequests::class)->postJson('/api/inquiry', [
            'first_name' => 'Spam',
            'last_name' => 'Bot',
            'email' => 'bot@spammer.com',
            'message' => 'Buy cheap meds now at our link!',
            'website_url' => 'https://spam-bot-trap.com',
        ]);

        $response->assertOk()
            ->assertJsonPath('message', 'Thank you for reaching out! Your message has been sent successfully.');

        // Must not save contact to database
        $this->assertDatabaseMissing('contacts', [
            'email' => 'bot@spammer.com',
        ]);

        // Must not send any email
        Mail::assertNothingSent();
    }

    public function test_inquiry_rate_limiting_blocks_more_than_5_submissions_per_minute(): void
    {
        Mail::fake();

        Setting::create([
            'inquiry_recipient_email' => 'admin@raisetech.com.np',
            'is_inquiry_notification_enabled' => false,
        ]);

        // Submit 5 requests (within rate limit of 5 per minute)
        for ($i = 1; $i <= 5; $i++) {
            $resp = $this->postJson('/api/inquiry', [
                'first_name' => "RateLimit{$i}",
                'last_name' => 'Test',
                'email' => "ratelimit{$i}@example.com",
                'message' => "Testing rate limit threshold message #{$i}",
            ]);
            $resp->assertCreated();
        }

        // 6th request from same IP must be throttled (HTTP 429)
        $rateLimitedResp = $this->postJson('/api/inquiry', [
            'first_name' => 'Exceeded',
            'last_name' => 'Test',
            'email' => 'exceeded@example.com',
            'message' => 'This 6th request should be blocked by rate limiting',
        ]);

        $rateLimitedResp->assertStatus(429)
            ->assertJsonPath('message', 'Too many messages sent from your IP. Please wait a minute before sending another inquiry.');
    }

    public function test_admin_can_update_google_oauth_settings(): void
    {
        $this->actingAsAdmin();

        $response = $this->postJson('/api/settings', [
            'google_client_id' => '123456789-mock.apps.googleusercontent.com',
            'google_client_secret' => 'GOCSPX-mocksecret12345',
            'is_google_login_enabled' => true,
        ]);

        $response->assertOk()
            ->assertJsonPath('setting.google_client_id', '123456789-mock.apps.googleusercontent.com')
            ->assertJsonPath('setting.is_google_login_enabled', true)
            ->assertJsonPath('setting.has_google_client_secret', true)
            ->assertJsonMissing(['google_client_secret' => 'GOCSPX-mocksecret12345']);

        $setting = Setting::first();
        $this->assertNotNull($setting->google_client_secret);
        $this->assertNotEquals('GOCSPX-mocksecret12345', $setting->google_client_secret);
        $this->assertEquals('GOCSPX-mocksecret12345', Crypt::decryptString($setting->google_client_secret));

        // Public index endpoint also never exposes the secret
        $publicResp = $this->getJson('/api/settings');
        $publicResp->assertOk()
            ->assertJsonPath('setting.google_client_id', '123456789-mock.apps.googleusercontent.com')
            ->assertJsonPath('setting.has_google_client_secret', true)
            ->assertJsonMissing(['google_client_secret']);
    }

    public function test_admin_can_clear_google_client_secret(): void
    {
        $this->actingAsAdmin();

        $setting = Setting::create([
            'google_client_id' => '123456789-mock.apps.googleusercontent.com',
            'google_client_secret' => Crypt::encryptString('existing-secret'),
        ]);

        $this->assertTrue($setting->fresh()->has_google_client_secret);

        $response = $this->postJson('/api/settings', [
            'remove_google_client_secret' => true,
        ]);

        $response->assertOk()
            ->assertJsonPath('setting.has_google_client_secret', false);

        $this->assertNull($setting->fresh()->google_client_secret);
    }

    public function test_google_login_respects_settings_toggle_and_audience(): void
    {
        // 1. When Google login is disabled in settings
        Setting::query()->delete();
        Setting::create([
            'is_google_login_enabled' => false,
        ]);

        $disabledResp = $this->postJson('/api/google-login', [
            'token' => 'dummy-google-token',
        ]);
        $disabledResp->assertStatus(403)
            ->assertJsonPath('message', 'Google login is currently disabled by administrator.');

        // 2. When Google login is enabled with configured client ID
        Setting::query()->delete();
        Setting::create([
            'google_client_id' => 'expected-client-id.apps.googleusercontent.com',
            'is_google_login_enabled' => true,
        ]);

        Http::fake(function (\Illuminate\Http\Client\Request $request) {
            $token = $request['id_token'] ?? null;
            if ($token === 'token-for-wrong-app') {
                return Http::response([
                    'sub' => 'google-user-123',
                    'email' => 'oauth-tester@example.com',
                    'name' => 'OAuth Tester',
                    'aud' => 'different-unauthorized-client-id.apps.googleusercontent.com',
                ]);
            }

            return Http::response([
                'sub' => 'google-user-123',
                'email' => 'oauth-tester@example.com',
                'name' => 'OAuth Tester',
                'aud' => 'expected-client-id.apps.googleusercontent.com',
            ]);
        });

        $mismatchResp = $this->postJson('/api/google-login', [
            'token' => 'token-for-wrong-app',
        ]);
        $mismatchResp->assertStatus(401)
            ->assertJsonPath('message', 'Google token was issued for an unauthorized client application.');

        $successResp = $this->postJson('/api/google-login', [
            'token' => 'valid-google-token',
        ]);
        $successResp->assertOk()
            ->assertJsonPath('message', 'Google login successful.')
            ->assertJsonPath('user.email', 'oauth-tester@example.com');
    }

    private function actingAsAdmin(): void
    {
        Sanctum::actingAs(User::factory()->create(['role' => 'admin']));
    }
}
