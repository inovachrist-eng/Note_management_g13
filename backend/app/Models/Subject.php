<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Models\CourseModule;
use App\Models\Grade;

class Subject extends Model
{
    protected $fillable = [
        'module_id',
        'name',
        'order_number'
    ];

    public function module()
    {
        return $this->belongsTo(CourseModule::class, 'module_id');
    }

    public function grades()
    {
        return $this->hasMany(Grade::class, 'subject_id');
    }
}