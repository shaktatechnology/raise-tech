<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('settings', function (Blueprint $table) {
            if (!Schema::hasColumn('settings', 'reply_to_email')) {
                $table->string('reply_to_email')->nullable()->after('inquiry_recipient_email');
            }
            if (!Schema::hasColumn('settings', 'sender_name')) {
                $table->string('sender_name')->nullable()->after('reply_to_email');
            }
        });

        Schema::table('contacts', function (Blueprint $table) {
            if (!Schema::hasColumn('contacts', 'subject')) {
                $table->string('subject')->nullable()->after('contact_no');
            }
            if (Schema::hasColumn('contacts', 'contact_no')) {
                $table->string('contact_no')->nullable()->change();
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('settings', function (Blueprint $table) {
            $cols = ['reply_to_email', 'sender_name'];
            $existing = array_filter($cols, fn($c) => Schema::hasColumn('settings', $c));
            if (!empty($existing)) {
                $table->dropColumn($existing);
            }
        });

        Schema::table('contacts', function (Blueprint $table) {
            if (Schema::hasColumn('contacts', 'subject')) {
                $table->dropColumn('subject');
            }
        });
    }
};
