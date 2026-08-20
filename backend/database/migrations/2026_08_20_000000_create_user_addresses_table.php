<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('user_addresses', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')
                ->constrained('users')
                ->cascadeOnDelete();
            $table->string('type', 20);
            $table->string('label', 100)->default('Checkout');
            $table->string('name');
            $table->string('phone_number', 30);
            $table->string('address', 500);
            $table->string('city', 100);
            $table->string('province', 100);
            $table->boolean('is_default')->default(true);
            $table->timestamps();

            $table->unique(['user_id', 'type']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('user_addresses');
    }
};
