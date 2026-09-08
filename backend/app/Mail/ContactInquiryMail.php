<?php

namespace App\Mail;

use App\Models\Contact;
use App\Models\Setting;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Address;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class ContactInquiryMail extends Mailable
{
    use Queueable, SerializesModels;

    public Contact $contact;

    /**
     * Create a new message instance.
     */
    public function __construct(Contact $contact)
    {
        $this->contact = $contact;
    }

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        $fullName = trim(($this->contact->first_name ?? '') . ' ' . ($this->contact->last_name ?? ''));
        // Prevent email-header injection by stripping CR and LF
        $safeName = trim(str_replace(["\r", "\n", "%0a", "%0d"], '', $fullName));
        $safeEmail = trim(str_replace(["\r", "\n", "%0a", "%0d"], '', $this->contact->email));

        $setting = Setting::first();

        // From address: must be verified MAIL_FROM_ADDRESS; from name can use Settings sender_name
        $fromAddress = config('mail.from.address', 'hello@example.com');
        $rawFromName = $setting?->sender_name ?: config('mail.from.name', config('app.name', 'Raise Tech'));
        $safeFromName = trim(str_replace(["\r", "\n", "%0a", "%0d"], '', $rawFromName));

        // Reply-To: visitor's email and name
        $replyToAddress = $safeEmail ?: ($setting?->reply_to_email ?: $fromAddress);
        $replyToName = $safeName ?: null;

        // Subject: visitor's subject or clear default
        if (!empty($this->contact->subject)) {
            $rawSubject = trim(str_replace(["\r", "\n", "%0a", "%0d"], '', $this->contact->subject));
            $subject = $rawSubject ?: "New Website Inquiry from {$safeName} - " . config('app.name', 'Raise Tech');
        } else {
            $senderLabel = $safeName ?: 'Website Visitor';
            $subject = "New Website Inquiry from {$senderLabel} - " . config('app.name', 'Raise Tech');
        }

        return new Envelope(
            from: new Address($fromAddress, $safeFromName),
            replyTo: [
                new Address($replyToAddress, $replyToName),
            ],
            subject: $subject,
        );
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        return new Content(
            view: 'emails.contact_inquiry',
            with: [
                'contact' => $this->contact,
            ],
        );
    }

    /**
     * Get the attachments for the message.
     *
     * @return array<int, \Illuminate\Mail\Mailables\Attachment>
     */
    public function attachments(): array
    {
        return [];
    }
}
