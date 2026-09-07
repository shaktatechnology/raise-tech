<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('settings', function (Blueprint $table) {
            if (!Schema::hasColumn('settings', 'company_name')) {
                $table->string('company_name')->nullable()->after('short_description');
            }
            if (!Schema::hasColumn('settings', 'contact_eyebrow')) {
                $table->string('contact_eyebrow')->nullable();
            }
            if (!Schema::hasColumn('settings', 'contact_title')) {
                $table->string('contact_title')->nullable();
            }
            if (!Schema::hasColumn('settings', 'contact_description')) {
                $table->text('contact_description')->nullable();
            }
            if (!Schema::hasColumn('settings', 'operating_hours')) {
                $table->string('operating_hours')->nullable();
            }
            if (!Schema::hasColumn('settings', 'operating_hours_note')) {
                $table->string('operating_hours_note')->nullable();
            }
        });
    }

    public function down(): void
    {
        Schema::table('settings', function (Blueprint $table) {
            $cols = ['company_name', 'contact_eyebrow', 'contact_title', 'contact_description', 'operating_hours', 'operating_hours_note'];
            $existing = array_filter($cols, fn($col) => Schema::hasColumn('settings', $col));
            if (!empty($existing)) {
                $table->dropColumn($existing);
            }
        });
    }
};
