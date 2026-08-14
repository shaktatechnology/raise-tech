<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Normalize fresh databases to the title column already used in production.
     */
    public function up(): void
    {
        if (
            Schema::hasTable('why_choose_us_items')
            && Schema::hasColumn('why_choose_us_items', 'name')
            && ! Schema::hasColumn('why_choose_us_items', 'title')
        ) {
            Schema::table('why_choose_us_items', function (Blueprint $table) {
                $table->renameColumn('name', 'title');
            });
        }
    }

    /**
     * Restore the original schema used by the first migration.
     */
    public function down(): void
    {
        if (
            Schema::hasTable('why_choose_us_items')
            && Schema::hasColumn('why_choose_us_items', 'title')
            && ! Schema::hasColumn('why_choose_us_items', 'name')
        ) {
            Schema::table('why_choose_us_items', function (Blueprint $table) {
                $table->renameColumn('title', 'name');
            });
        }
    }
};
