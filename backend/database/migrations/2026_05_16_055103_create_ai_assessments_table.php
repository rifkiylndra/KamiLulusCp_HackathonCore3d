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
    Schema::create('ai_assessments', function (Blueprint $table) {
        $table->id();
        $table->foreignId('meal_submission_id')->unique()->constrained()->onDelete('cascade');
        $table->tinyInteger('nutrition_score')->default(0);
        $table->tinyInteger('safety_score')->default(0);
        $table->tinyInteger('sanitation_score')->default(0);
        $table->tinyInteger('final_score')->default(0);
        $table->enum('status', ['AMAN','PERHATIAN','BAHAYA']);
        $table->tinyInteger('violations_count')->default(0);
        $table->boolean('immediate_action_required')->default(false);
        $table->longText('raw_response');
        $table->integer('processing_time_ms')->nullable();
        $table->timestamps();
    });
}
    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('ai_assessments');
    }
};
