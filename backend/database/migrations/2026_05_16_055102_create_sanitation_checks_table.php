<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
public function up()
{
    Schema::create('sanitation_checks', function (Blueprint $table) {
        $table->id();
        $table->foreignId('meal_submission_id')->constrained()->onDelete('cascade');
        $table->boolean('apd_used');
        $table->boolean('kitchen_cleaned');
        $table->enum('storage_type', ['freezer','kulkas','suhu_ruang']);
        $table->enum('ingredient_condition', ['baik','rusak','mencurigakan']);
        $table->enum('supplier_source', ['resmi','pasar','lainnya']);
        $table->timestamps();
    });
}

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('sanitation_checks');
    }
};
