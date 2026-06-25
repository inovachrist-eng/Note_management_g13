<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('grades', function (Blueprint $table) {

            $table->id();

            $table->foreignId('subject_id')
                ->constrained()
                ->onDelete('cascade');

            $table->string('type')->default('devoir');

            $table->integer('session')->default(1);

            $table->integer('score');

            $table->integer('order_number')->default(1);

            $table->timestamps();

        });
    }

    public function down(): void
    {
        Schema::dropIfExists('grades');
    }
};