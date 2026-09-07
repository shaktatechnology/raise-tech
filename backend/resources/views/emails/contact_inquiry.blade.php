<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>New Website Inquiry</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            background-color: #f4f6f8;
            margin: 0;
            padding: 24px;
            color: #1f2937;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
            border: 1px solid #e5e7eb;
        }
        .header {
            background: linear-gradient(135deg, #0ea5e9, #0284c7);
            padding: 24px 32px;
            color: #ffffff;
        }
        .header h1 {
            margin: 0;
            font-size: 20px;
            font-weight: 700;
        }
        .header p {
            margin: 6px 0 0;
            font-size: 13px;
            opacity: 0.9;
        }
        .content {
            padding: 28px 32px;
        }
        .field-group {
            margin-bottom: 20px;
        }
        .field-label {
            font-size: 11px;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            color: #6b7280;
            font-weight: 600;
            margin-bottom: 4px;
        }
        .field-value {
            font-size: 15px;
            color: #111827;
            font-weight: 500;
        }
        .field-value a {
            color: #0284c7;
            text-decoration: none;
        }
        .field-value a:hover {
            text-decoration: underline;
        }
        .message-box {
            background-color: #f9fafb;
            border: 1px solid #e5e7eb;
            border-left: 4px solid #0ea5e9;
            padding: 16px;
            border-radius: 8px;
            font-size: 14px;
            line-height: 1.6;
            color: #374151;
            white-space: pre-wrap;
            word-break: break-word;
        }
        .btn-row {
            margin-top: 28px;
            text-align: center;
        }
        .reply-btn {
            display: inline-block;
            background-color: #0ea5e9;
            color: #ffffff !important;
            padding: 12px 28px;
            border-radius: 8px;
            text-decoration: none;
            font-weight: 600;
            font-size: 14px;
        }
        .footer {
            border-top: 1px solid #f3f4f6;
            padding: 16px 32px;
            font-size: 12px;
            color: #9ca3af;
            text-align: center;
            background-color: #fafafa;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>📬 New Contact Form Message</h1>
            <p>You have received a new inquiry from the Raise Tech website.</p>
        </div>

        <div class="content">
            <div class="field-group">
                <div class="field-label">Sender Name</div>
                <div class="field-value">{{ $contact->first_name }} {{ $contact->last_name }}</div>
            </div>

            <div class="field-group">
                <div class="field-label">Email Address</div>
                <div class="field-value">
                    <a href="mailto:{{ $contact->email }}">{{ $contact->email }}</a>
                </div>
            </div>

            <div class="field-group">
                <div class="field-label">Contact Number</div>
                <div class="field-value">
                    <a href="tel:{{ $contact->contact_no }}">{{ $contact->contact_no }}</a>
                </div>
            </div>

            <div class="field-group">
                <div class="field-label">Received At</div>
                <div class="field-value">{{ $contact->created_at ? $contact->created_at->format('M d, Y h:i A') : now()->format('M d, Y h:i A') }}</div>
            </div>

            <div class="field-group">
                <div class="field-label">Message</div>
                <div class="message-box">{{ $contact->message }}</div>
            </div>

            <div class="btn-row">
                <a href="mailto:{{ $contact->email }}?subject=Re:%20Inquiry%20from%20Raise%20Tech" class="reply-btn">
                    Reply to {{ $contact->first_name }}
                </a>
            </div>
        </div>

        <div class="footer">
            This email was sent automatically from your website's contact form.
        </div>
    </div>
</body>
</html>
