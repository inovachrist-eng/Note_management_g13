<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Mail\MagicLinkMail;
use App\Models\MagicLinkToken;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;

class PasswordlessAuthController extends Controller
{
    // Envoie le lien magique par email
    public function send(Request $request)
    {
        $request->validate([
            'email' => 'required|email|exists:users,email',
        ], [
            'email.exists' => 'Aucun compte associé à cet email.',
        ]);

        $email = $request->input('email');

        // Supprime les anciens tokens de cet email
        MagicLinkToken::where('email', $email)->delete();

        $token = Str::random(64);

        MagicLinkToken::create([
            'email'      => $email,
            'token'      => $token,
            'expires_at' => now()->addMinutes(15),
        ]);

        $user     = User::where('email', $email)->first();
        $magicUrl = config('app.frontend_url') . '/magic-link?token=' . $token;

        Mail::to($email)->send(new MagicLinkMail($magicUrl, $user->full_name));

        return response()->json([
            'message' => 'Lien de connexion envoyé à ' . $email,
        ]);
    }

    // Vérifie le token et retourne un token Sanctum
    public function verify(Request $request)
    {
        $request->validate([
            'token' => 'required|string',
        ]);

        $record = MagicLinkToken::where('token', $request->input('token'))->first();

        if (! $record) {
            return response()->json(['message' => 'Lien invalide ou déjà utilisé.'], 422);
        }

        if ($record->isExpired()) {
            $record->delete();
            return response()->json(['message' => 'Ce lien a expiré. Demandez-en un nouveau.'], 422);
        }

        $user = User::where('email', $record->email)->first();

        if (! $user) {
            return response()->json(['message' => 'Utilisateur introuvable.'], 404);
        }

        $record->delete();

        $token = $user->createToken('magic_link')->plainTextToken;

        return response()->json([
            'message' => 'Connexion réussie',
            'token'   => $token,
            'user'    => $user,
        ]);
    }
}
