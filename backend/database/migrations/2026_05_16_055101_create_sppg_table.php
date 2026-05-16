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
    Schema::create('sppg', function (Blueprint $table) {
        $table->id();
        $table->string('name');
        $table->string('location');
        $table->string('province');
        $table->string('contact_person')->nullable();
        $table->string('phone')->nullable();
        $table->boolean('has_slhs')->default(false);
        $table->timestamps();
        $table->index('province');
    });
}

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('sppg');
    }
};
