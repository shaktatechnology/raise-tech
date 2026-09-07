<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('settings', function (Blueprint $table) {
            if (!Schema::hasColumn('settings', 'inquiry_recipient_email')) {
                $table->string('inquiry_recipient_email')->nullable()->after('email2');
            }
            if (!Schema::hasColumn('settings', 'is_inquiry_notification_enabled')) {
                $table->boolean('is_inquiry_notification_enabled')->default(true)->after('inquiry_recipient_email');
            }
        });
    }

    public function down(): void
    {
        Schema::table('settings', function (Blueprint $table) {
            $columnsToDrop = [];
            if (Schema::hasColumn('settings', 'inquiry_recipient_email')) {
                $columnsToDrop[] = 'inquiry_recipient_email';
            }
            if (Schema::hasColumn('settings', 'is_inquiry_notification_enabled')) {
                $columnsToDrop[] = 'is_inquiry_notification_enabled';
            }
            if (!empty($columnsToDrop)) {
                $table->dropColumn($columnsToDrop);
            }
        });
    }
};
