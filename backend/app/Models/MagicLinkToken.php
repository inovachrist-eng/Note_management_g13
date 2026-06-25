<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class MagicLinkToken extends Model
{
    protected $fillable = ['email', 'token', 'expires_at'];

    protected $casts = [
        'expires_at' => 'datetime',
    ];

    public function isExpired(): bool
    {
        return $this->expires_at->isPast();
    }
}
