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
            if (!Schema::hasColumn('settings', 'mail_mailer')) {
                $table->string('mail_mailer')->nullable()->default('smtp')->after('sender_name');
            }
            if (!Schema::hasColumn('settings', 'mail_host')) {
                $table->string('mail_host')->nullable()->after('mail_mailer');
            }
            if (!Schema::hasColumn('settings', 'mail_port')) {
                $table->integer('mail_port')->nullable()->after('mail_host');
            }
            if (!Schema::hasColumn('settings', 'mail_username')) {
                $table->string('mail_username')->nullable()->after('mail_port');
            }
            if (!Schema::hasColumn('settings', 'mail_password')) {
                $table->text('mail_password')->nullable()->after('mail_username');
            }
            if (!Schema::hasColumn('settings', 'mail_encryption')) {
                $table->string('mail_encryption')->nullable()->after('mail_password');
            }
            if (!Schema::hasColumn('settings', 'mail_from_address')) {
                $table->string('mail_from_address')->nullable()->after('mail_encryption');
            }
            if (!Schema::hasColumn('settings', 'mail_from_name')) {
                $table->string('mail_from_name')->nullable()->after('mail_from_address');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('settings', function (Blueprint $table) {
            $cols = [
                'mail_mailer',
                'mail_host',
                'mail_port',
                'mail_username',
                'mail_password',
                'mail_encryption',
                'mail_from_address',
                'mail_from_name',
            ];
            $existing = array_filter($cols, fn($c) => Schema::hasColumn('settings', $c));
            if (!empty($existing)) {
                $table->dropColumn($existing);
            }
        });
    }
};
