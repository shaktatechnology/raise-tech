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
        Schema::table('about', function (Blueprint $table) {
            $table->dropColumn('why_choose_us_image');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('about', function (Blueprint $table) {
            $table->string('why_choose_us_image')->nullable();
        });
    }
};
