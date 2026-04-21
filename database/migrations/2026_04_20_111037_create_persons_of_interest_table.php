<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('persons_of_interest', function (Blueprint $table) {
            $table->id();

            // Identification
            $table->string('code', 50)->unique()->index();         
            $table->string('name')->index();                       
            $table->string('alias')->nullable();                  
            $table->text('identifying_marks')->nullable();         

            // Personal Info
            $table->date('date_of_birth')->nullable();
            $table->enum('sex', ['male', 'female', 'other'])->nullable();
            $table->enum('civil_status', [
                'single', 'married', 'separated', 'widowed', 'annulled'
            ])->nullable();
            $table->string('spouse_name')->nullable();
            $table->unsignedTinyInteger('no_of_dependents')->nullable();

            // Contact & Address
            $table->text('address')->nullable();

            // Background
            $table->string('educational_attainment')->nullable();
            $table->string('occupation')->nullable();
            $table->decimal('monthly_income', 10, 2)->nullable();
            $table->string('hobbies')->nullable();
            $table->string('skills')->nullable();
            $table->string('religious_affiliation')->nullable();

            // Sibling Info
            $table->unsignedTinyInteger('sibling_rank')->nullable();
            $table->unsignedTinyInteger('sibling_male_count')->nullable();
            $table->unsignedTinyInteger('sibling_female_count')->nullable();

            // System
            $table->enum('status', ['active', 'inactive'])->default('active')->index();
            $table->text('notes')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('persons_of_interest');
    }
};