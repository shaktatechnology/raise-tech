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
            if (!Schema::hasColumn('settings', 'google_client_id')) {
                $table->string('google_client_id', 500)->nullable()->after('payment_methods');
            }
            if (!Schema::hasColumn('settings', 'google_client_secret')) {
                $table->text('google_client_secret')->nullable()->after('google_client_id');
            }
            if (!Schema::hasColumn('settings', 'is_google_login_enabled')) {
                $table->boolean('is_google_login_enabled')->default(true)->after('google_client_secret');
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
                'google_client_id',
                'google_client_secret',
                'is_google_login_enabled',
            ];
            $existing = array_filter($cols, fn($c) => Schema::hasColumn('settings', $c));
            if (!empty($existing)) {
                $table->dropColumn($existing);
            }
        });
    }
};
