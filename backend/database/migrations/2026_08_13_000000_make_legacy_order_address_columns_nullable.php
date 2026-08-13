<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->text('shipping_address')->nullable()->change();
            $table->string('city')->nullable()->change();
        });
    }

    public function down(): void
    {
        DB::table('orders')->whereNull('shipping_address')->update(['shipping_address' => '']);
        DB::table('orders')->whereNull('city')->update(['city' => '']);

        Schema::table('orders', function (Blueprint $table) {
            $table->text('shipping_address')->nullable(false)->change();
            $table->string('city')->nullable(false)->change();
        });
    }
};
