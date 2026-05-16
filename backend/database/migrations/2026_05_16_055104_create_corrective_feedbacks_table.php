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
    Schema::create('corrective_feedbacks', function (Blueprint $table) {
        $table->id();
        $table->foreignId('ai_assessment_id')->unique()->constrained()->onDelete('cascade');
        $table->json('immediate_actions');
        $table->json('tomorrow_improvements');
        $table->json('routine_notes');
        $table->dateTime('generated_at');
        $table->timestamps();
    });
}

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('corrective_feedbacks');
    }
};
