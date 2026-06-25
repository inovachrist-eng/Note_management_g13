<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use App\Models\User;

class AuthController extends Controller
{
    // ─────────────────────────────────────────────────────────────────────────
    // Inscription
    // ─────────────────────────────────────────────────────────────────────────
    public function register(Request $request)
    {
        $request->validate([
            'full_name' => 'required|string|max:225',
            'email'     => 'required|email|unique:users,email',
        ], [
            'email.unique' => 'Un compte existe déjà avec cet email.',
        ]);

        $user = User::create([
            'full_name' => $request->full_name,
            'email'     => $request->email,
            'password'  => Hash::make(Str::random(32)),
        ]);

        return response()->json([
            'message' => 'Compte créé. Connectez-vous via le lien magique envoyé à votre email.',
            'user'    => $user,
        ], 201);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Déconnexion
    // ─────────────────────────────────────────────────────────────────────────
    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'message' => 'Déconnexion réussie',
        ]);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Profil simple
    // ─────────────────────────────────────────────────────────────────────────
    public function user(Request $request)
    {
        return response()->json([
            'user' => $request->user(),
        ]);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Profil complet avec toutes les relations
    // ─────────────────────────────────────────────────────────────────────────
    public function userFull(Request $request)
    {
        $data = $request->user()->load([
            'academicYears' => fn ($q) => $q->orderBy('id', 'asc'),

            'academicYears.semesters' => fn ($q) => $q->orderBy('order_number', 'asc'),

            'academicYears.semesters.modules' => fn ($q) => $q->orderBy('order_number', 'asc'),

            'academicYears.semesters.modules.subjects' => fn ($q) => $q->orderBy('order_number', 'asc'),

            'academicYears.semesters.modules.subjects.grades' => fn ($q) => $q->orderBy('order_number', 'asc'),
        ]);

        return response()->json([
            'message' => 'Données utilisateur complètes',
            'user'    => $data,
        ]);
    }
}
