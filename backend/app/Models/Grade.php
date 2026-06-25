<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Grade extends Model
{
    protected $casts = [
        'score' => 'decimal:2',
    ];

    protected $fillable = [
        'subject_id',
        'type',
        'session',
        'score',
        'order_number'
    ];

    public function subject()
    {
        return $this->belongsTo(Subject::class);
    }
}