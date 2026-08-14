<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('about', function (Blueprint $table) {
            $table->text('about_description')->nullable()->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        DB::table('about')
            ->whereNotNull('about_description')
            ->update([
                'about_description' => DB::raw('LEFT(about_description, 255)'),
            ]);

        Schema::table('about', function (Blueprint $table) {
            $table->string('about_description')->nullable()->change();
        });
    }
};
