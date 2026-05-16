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
    Schema::create('violations', function (Blueprint $table) {
        $table->id();
        $table->foreignId('ai_assessment_id')->constrained()->onDelete('cascade');
        $table->string('dimension');
        $table->enum('severity', ['LOW','MEDIUM','HIGH','CRITICAL']);
        $table->text('description');
        $table->text('corrective_action');
        $table->timestamps();
    });
}
    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('violations');
    }
};
