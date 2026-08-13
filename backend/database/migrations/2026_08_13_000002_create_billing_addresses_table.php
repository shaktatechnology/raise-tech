<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('billing_addresses', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_id')
                ->unique()
                ->constrained('orders')
                ->cascadeOnDelete();
            $table->string('name');
            $table->string('address', 500);
            $table->string('city', 100);
            $table->string('province', 100);
            $table->string('phone_number', 30);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('billing_addresses');
    }
};
