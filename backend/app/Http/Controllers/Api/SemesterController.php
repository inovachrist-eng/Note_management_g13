<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\AcademicYear;
use App\Models\Semester;
use Illuminate\Support\Facades\DB;

class SemesterController extends Controller
{
    // ─────────────────────────────────────────────────────────────────────────
    // ➕  AJOUTER UN SEMESTRE  (order_number auto-incrémenté)
    // ─────────────────────────────────────────────────────────────────────────
    public function add_semester(Request $request)
    {
        $request->validate([
            'name'             => 'required|string|max:225',
            'academic_year_id' => 'required|integer|exists:academic_years,id',
        ]);

        $academicYear = AcademicYear::findOrFail($request->academic_year_id);

        // Auto-incrément : récupère le max existant pour cette année
        $maxOrder = Semester::where('academic_year_id', $academicYear->id)
            ->max('order_number') ?? 0;

        $semester = Semester::create([
            'academic_year_id' => $academicYear->id,
            'name'             => $request->name,
            'order_number'     => $maxOrder + 1,
        ]);

        return response()->json([
            'message' => 'Semestre ajouté avec succès',
            'data'    => $semester,
        ], 201);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // ✏️  MODIFIER UN SEMESTRE
    // ─────────────────────────────────────────────────────────────────────────
    public function mod_semester(Request $request)
    {
        $request->validate([
            'id'   => 'required|integer|exists:semesters,id',
            'name' => 'required|string|max:225',
        ]);

        $semester = Semester::findOrFail($request->id);

        $semester->update(['name' => $request->name]);

        return response()->json([
            'message' => 'Semestre modifié avec succès',
            'data'    => $semester,
        ]);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // 🗑  SUPPRIMER UN SEMESTRE  (réordonne les suivants)
    // ─────────────────────────────────────────────────────────────────────────
    public function delete_semester(Request $request)
    {
        $request->validate([
            'id' => 'required|exists:semesters,id',
        ]);

        $semester = Semester::findOrFail($request->id);

        $academicYearId = $semester->academic_year_id;
        $deletedOrder   = $semester->order_number;

        $semester->delete();

        // Décrémente l'ordre des semestres suivants pour éviter les trous
        Semester::where('academic_year_id', $academicYearId)
            ->where('order_number', '>', $deletedOrder)
            ->decrement('order_number');

        return response()->json([
            'message' => 'Semestre supprimé avec succès',
        ]);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // 🔁  CHANGER L'ORDRE D'UN SEMESTRE  (swap propre)
    // ─────────────────────────────────────────────────────────────────────────
    public function change_semester(Request $request)
    {
        $request->validate([
            'id'           => 'required|exists:semesters,id',
            'order_number' => 'required|integer|min:1',
        ]);

        $semester = Semester::findOrFail($request->id);

        $oldOrder = $semester->order_number;
        $newOrder = $request->order_number;

        if ($oldOrder === $newOrder) {
            return response()->json(['message' => 'Aucun changement']);
        }

        DB::transaction(function () use ($semester, $oldOrder, $newOrder) {
            if ($newOrder < $oldOrder) {
                // Montée : décale les autres vers le bas
                Semester::where('academic_year_id', $semester->academic_year_id)
                    ->whereBetween('order_number', [$newOrder, $oldOrder - 1])
                    ->increment('order_number');
            } else {
                // Descente : décale les autres vers le haut
                Semester::where('academic_year_id', $semester->academic_year_id)
                    ->whereBetween('order_number', [$oldOrder + 1, $newOrder])
                    ->decrement('order_number');
            }

            $semester->update(['order_number' => $newOrder]);
        });

        return response()->json([
            'message' => 'Ordre modifié avec succès',
            'data'    => $semester->fresh(),
        ]);
    }
}