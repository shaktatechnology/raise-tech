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
            if (!Schema::hasColumn('settings', 'logo')) {
                $table->string('logo')->nullable()->after('short_description');
            }
            if (!Schema::hasColumn('settings', 'favicon')) {
                $table->string('favicon')->nullable()->after('logo');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('settings', function (Blueprint $table) {
            $columnsToDrop = [];
            if (Schema::hasColumn('settings', 'logo')) {
                $columnsToDrop[] = 'logo';
            }
            if (Schema::hasColumn('settings', 'favicon')) {
                $columnsToDrop[] = 'favicon';
            }
            if (!empty($columnsToDrop)) {
                $table->dropColumn($columnsToDrop);
            }
        });
    }
};
