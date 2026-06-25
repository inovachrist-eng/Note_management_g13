<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CourseModule extends Model
{
    protected $table = 'modules';

    protected $fillable = [
        'semester_id',
        'name',
        'credits',
        'order_number'
    ];

    public function semester()
    {
        return $this->belongsTo(Semester::class);
    }

    public function subjects()
    {
        return $this->hasMany(Subject::class, 'module_id');
    }
}