<?php

namespace App\Models;

use App\Models\AcademicYear;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Database\Eloquent\Relations\HasMany;

class User extends Authenticatable
{
    use HasFactory, Notifiable, HasApiTokens;

    /**
     * Champs modifiables
     */
    protected $fillable = [
        'full_name',
        'email',
        'password',
    ];

    /**
     * Champs cachés
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Cast automatique
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    /**
     * Relation :
     * Un utilisateur possède plusieurs années scolaires
     */
    public function academicYears(): HasMany
    {
        return $this->hasMany(AcademicYear::class);
    }
}