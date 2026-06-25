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
    {   Schema::create('subjects', function (Blueprint $table) {
        $table->id();

        $table->foreignId("module_id")->constrained()
        ->onDelete('cascade');

        $table->string("name");

        $table->integer("order_number")->default(1);
        
        $table->timestamps();
        });
    }

    /**
     * Reve/rse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('subjects');
    }
};
