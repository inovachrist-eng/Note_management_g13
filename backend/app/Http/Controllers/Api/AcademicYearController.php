<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;

use Illuminate\Http\Request;

use Illuminate\Support\Facades\Auth;

use Illuminate\Support\Facades\Hash;
use App\Models\AcademicYear;
use App\Models\User;

class AcademicYearController extends Controller
{
    public function add_academic_years(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:225'
        ]);
    
        $user = $request->user();
    
        $academicYear = AcademicYear::create([
            'user_id' => $user->id,
            'name' => $request->name
        ]);
    
        return response()->json([
            'message' => 'Nouvelle année scolaire ajoutée',
            'data' => $academicYear
        ]);
    }

    public function mod_academic_years(Request $request)
    {
        $request->validate([
            'id' => 'required|integer|exists:academic_years,id',
            'name' => 'required|string|max:255'
        ]);

        $user = $request->user();

        // récupérer l'année académique
        $academicYear = AcademicYear::where('id', $request->id)->first();

        // sécurité : vérifier si elle existe (optionnel car exists déjà)
        if (!$academicYear) {
            return response()->json([
                'message' => 'Année académique introuvable'
            ], 404);
        }

        // mise à jour
        $academicYear->update([
            'name' => $request->name
        ]);

        return response()->json([
            'message' => 'Modifié avec succès',
            'data' => $academicYear
        ]);
    }

        public function delete_academic_years(Request $request)
    {
        $request->validate([
            'id' => 'required|integer|exists:academic_years,id'
        ]);
    
        $user = $request->user();
    
        $academicYear = AcademicYear::where('id', $request->id)->first();
    
        if (!$academicYear) {
            return response()->json([
                'message' => 'Année académique introuvable'
            ], 404);
        }
    
        $academicYear->delete();
    
        return response()->json([
            'message' => 'Année académique supprimée avec succès',
            'data' => $academicYear
        ]);
    }


}
