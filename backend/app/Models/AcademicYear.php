<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AcademicYear extends Model
{
    protected $fillable = [
        'user_id',
        'name'
    ];

    public function semesters()
    {
        return $this->hasMany(Semester::class);
    }
}