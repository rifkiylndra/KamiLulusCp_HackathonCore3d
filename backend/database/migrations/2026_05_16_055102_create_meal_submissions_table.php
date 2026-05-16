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
    Schema::create('meal_submissions', function (Blueprint $table) {
        $table->id();
        $table->foreignId('sppg_id')->constrained('sppg')->onDelete('cascade');
        $table->string('submitted_by');
        $table->string('menu_name');
        $table->integer('portion_count');
        $table->dateTime('cook_start_at');
        $table->dateTime('serve_planned_at');
        $table->dateTime('distribute_at')->nullable();
        $table->string('image_path')->nullable();
        $table->enum('status', ['pending','processing','completed','failed'])->default('pending');
        $table->timestamps();
        $table->index(['sppg_id', 'status']);
    });
}

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('meal_submissions');
    }
};
