<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('settings', function (Blueprint $table) {
            $table->boolean('is_standard_delivery_enabled')->default(true)->after('is_cod_enabled');
            $table->boolean('is_express_delivery_enabled')->default(true)->after('is_standard_delivery_enabled');
        });
    }

    public function down(): void
    {
        Schema::table('settings', function (Blueprint $table) {
            $table->dropColumn(['is_standard_delivery_enabled', 'is_express_delivery_enabled']);
        });
    }
};
