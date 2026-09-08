<?php

namespace App\Services;

use App\Models\Setting;
use Illuminate\Support\Facades\Crypt;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Throwable;

class MailConfigService
{
    /**
     * Apply database-configured SMTP settings to the runtime mail configuration.
     * Falls back to default .env configuration if setting values are not provided.
     */
    public static function apply(?Setting $setting = null): void
    {
        $setting = $setting ?: Setting::first();
        if (!$setting) {
            return;
        }

        $overrides = [];
        $purgeNeeded = false;

        // Custom SMTP Host
        if (!empty($setting->mail_host)) {
            $overrides['mail.mailers.smtp.host'] = trim($setting->mail_host);
            $purgeNeeded = true;
        }

        // Custom SMTP Port
        if (!empty($setting->mail_port)) {
            $overrides['mail.mailers.smtp.port'] = (int) $setting->mail_port;
            $purgeNeeded = true;
        }

        // Custom SMTP Username
        if (!empty($setting->mail_username)) {
            $overrides['mail.mailers.smtp.username'] = trim($setting->mail_username);
            $purgeNeeded = true;
        }

        // Custom SMTP Password (stored encrypted)
        if (!empty($setting->mail_password)) {
            try {
                $decryptedPassword = Crypt::decryptString($setting->mail_password);
                $overrides['mail.mailers.smtp.password'] = $decryptedPassword;
                $purgeNeeded = true;
            } catch (Throwable $e) {
                // If it fails to decrypt, it might have been saved as plaintext in testing or corrupt
                Log::warning('Failed to decrypt mail_password: ' . $e->getMessage());
            }
        }

        // Custom SMTP Encryption ('tls', 'ssl', 'starttls', or 'none' / null)
        if ($setting->mail_encryption !== null) {
            $enc = strtolower(trim($setting->mail_encryption));
            if ($enc === 'none' || $enc === 'null' || $enc === '') {
                $overrides['mail.mailers.smtp.encryption'] = null;
            } else {
                $overrides['mail.mailers.smtp.encryption'] = $enc;
            }
            $purgeNeeded = true;
        }

        // Custom Mailer Transport
        if (!empty($setting->mail_mailer)) {
            $overrides['mail.mailers.smtp.transport'] = trim($setting->mail_mailer);
            $purgeNeeded = true;
        }

        // Custom From Address
        $fromAddress = $setting->mail_from_address ?: ($setting->mail_username ?: $setting->email1);
        if (!empty($fromAddress)) {
            $overrides['mail.from.address'] = trim($fromAddress);
        }

        // Custom From Name / Sender Name
        $fromName = $setting->mail_from_name ?: ($setting->sender_name ?: $setting->company_name);
        if (!empty($fromName)) {
            $overrides['mail.from.name'] = trim($fromName);
        }

        if (!empty($overrides)) {
            config($overrides);
        }

        if ($purgeNeeded) {
            try {
                Mail::purge('smtp');
            } catch (Throwable $e) {
                // Purge may fail if smtp mailer hasn't been instantiated yet
            }
        }
    }
}
