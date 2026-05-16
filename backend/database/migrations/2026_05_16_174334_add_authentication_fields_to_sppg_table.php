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
        if (!Schema::hasColumn('sppg', 'email')) {
            Schema::table('sppg', function (Blueprint $table) {
                $table->string('email')->nullable()->after('name');
            });
        }
        
        if (!Schema::hasColumn('sppg', 'password')) {
            Schema::table('sppg', function (Blueprint $table) {
                $table->string('password')->nullable()->after('email');
            });
        }
        
        if (!Schema::hasColumn('sppg', 'remember_token')) {
            Schema::table('sppg', function (Blueprint $table) {
                $table->rememberToken();
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('sppg', function (Blueprint $table) {
            $table->dropColumn(['email', 'password', 'remember_token']);
        });
    }
};
