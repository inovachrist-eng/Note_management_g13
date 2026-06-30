<?php

use App\Mail\MagicLinkMail;
use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return view('welcome');
});

/*
| Prévisualisation de l'email "magic link" dans le navigateur.
| Accessible uniquement en environnement local : http://localhost:8000/preview/magic-link
*/
Route::get('/preview/magic-link', function () {
    abort_unless(app()->environment('local'), 404);

    return new MagicLinkMail(
        magicUrl: url('/api/auth/magic-link/verify?token=demo-token-0123456789abcdef'),
        userName: 'Christ',
    );
});
