<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('settings', function (Blueprint $table) {
            $table->decimal('standard_delivery_charge', 10, 2)->default(100.00)->after('is_cod_enabled');
            $table->decimal('express_delivery_charge', 10, 2)->default(250.00)->after('standard_delivery_charge');
        });
    }

    public function down(): void
    {
        Schema::table('settings', function (Blueprint $table) {
            $table->dropColumn(['standard_delivery_charge', 'express_delivery_charge']);
        });
    }
};
