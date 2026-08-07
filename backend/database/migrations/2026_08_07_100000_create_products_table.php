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
        Schema::create('products', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->string('slug')->unique();
            $table->string('sku')->unique()->nullable();

            $table->text('short_description')->nullable();
            $table->longText('description')->nullable();

            $table->decimal('original_price', 10, 2);
            $table->string('discount_type')->nullable(); // e.g., 'percentage', 'fixed'
            $table->decimal('discount_value', 10, 2)->nullable()->default(0.00);

            $table->integer('stock_quantity')->default(0);
            $table->integer('sold_count')->default(0);

            $table->string('featured_image');

            $table->boolean('is_active')->default(true);

            $table->string('meta_title')->nullable();
            $table->text('meta_description')->nullable();

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('products');
    }
};
