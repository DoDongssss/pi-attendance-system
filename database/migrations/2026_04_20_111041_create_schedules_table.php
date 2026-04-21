<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('schedules', function (Blueprint $table) {
            $table->id();
            $table->foreignId('pi_id')
                ->constrained('persons_of_interest')
                ->cascadeOnDelete();
            $table->tinyInteger('month');
            $table->smallInteger('year');
            $table->json('expected_days');
            $table->time('late_threshold')->default('08:00:00');
            $table->timestamps();

            $table->unique(['pi_id', 'month', 'year']);
        });
    }
    public function down(): void
    {
        Schema::dropIfExists('schedules');
    }
};