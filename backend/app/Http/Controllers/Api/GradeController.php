<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Grade;
use App\Models\Subject;
use Illuminate\Support\Facades\DB;

class GradeController extends Controller
{
    // ─────────────────────────────────────────────────────────────────────────
    // ➕  AJOUTER UNE NOTE  (order_number auto-incrémenté)
    // ─────────────────────────────────────────────────────────────────────────
    public function add_grade(Request $request)
    {
        $request->validate([
            'subject_id' => 'required|exists:subjects,id',
            'type'       => 'sometimes|string|max:50',
            'session'    => 'required|integer|in:1,2',
            'score'      => 'required|numeric|min:0|max:20',
        ]);

        $subject = Subject::findOrFail($request->subject_id);

        $maxOrder = Grade::where('subject_id', $subject->id)
            ->max('order_number') ?? 0;

        $grade = Grade::create([
            'subject_id'   => $subject->id,
            'type'         => $request->type ?? 'examen',
            'session'      => $request->session,
            'score'        => $request->score,
            'order_number' => $maxOrder + 1,
        ]);

        return response()->json([
            'message' => 'Note ajoutée avec succès',
            'data'    => $grade,
        ], 201);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // ✏️  MODIFIER UNE NOTE
    // ─────────────────────────────────────────────────────────────────────────
    public function mod_grade(Request $request)
    {
        $request->validate([
            'id'      => 'required|exists:grades,id',
            'score'   => 'sometimes|numeric|min:0|max:20',
            'type'    => 'sometimes|string|max:50',
            'session' => 'sometimes|integer|in:1,2',
        ]);

        $grade = Grade::findOrFail($request->id);
        $grade->update($request->only(['score', 'type', 'session']));

        return response()->json([
            'message' => 'Note modifiée avec succès',
            'data'    => $grade,
        ]);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // 🗑  SUPPRIMER UNE NOTE  (réordonne les suivantes)
    // ─────────────────────────────────────────────────────────────────────────
    public function delete_grade(Request $request)
    {
        $request->validate([
            'id' => 'required|exists:grades,id',
        ]);

        $grade = Grade::findOrFail($request->id);
        $subjectId    = $grade->subject_id;
        $deletedOrder = $grade->order_number;

        $grade->delete();

        Grade::where('subject_id', $subjectId)
            ->where('order_number', '>', $deletedOrder)
            ->decrement('order_number');

        return response()->json(['message' => 'Note supprimée avec succès']);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // 🔁  CHANGER L'ORDRE D'UNE NOTE  (swap propre)
    // ─────────────────────────────────────────────────────────────────────────
    public function change_grade_order(Request $request)
    {
        $request->validate([
            'id'           => 'required|exists:grades,id',
            'order_number' => 'required|integer|min:1',
        ]);

        $grade = Grade::findOrFail($request->id);
        $oldOrder = $grade->order_number;
        $newOrder = $request->order_number;

        if ($oldOrder === $newOrder) {
            return response()->json(['message' => 'Aucun changement']);
        }

        DB::transaction(function () use ($grade, $oldOrder, $newOrder) {
            if ($newOrder < $oldOrder) {
                Grade::where('subject_id', $grade->subject_id)
                    ->whereBetween('order_number', [$newOrder, $oldOrder - 1])
                    ->increment('order_number');
            } else {
                Grade::where('subject_id', $grade->subject_id)
                    ->whereBetween('order_number', [$oldOrder + 1, $newOrder])
                    ->decrement('order_number');
            }
            $grade->update(['order_number' => $newOrder]);
        });

        return response()->json([
            'message' => 'Ordre de la note modifié avec succès',
            'data'    => $grade->fresh(),
        ]);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // 📋  NOTES LIBRES (N1–N10)  — contrôle continu, TD, TP, etc.
    //
    //  Reçoit un tableau de scores et les persiste avec session=0 et type='libre'.
    //  Supprime les anciennes notes libres de la matière avant d'insérer.
    // ─────────────────────────────────────────────────────────────────────────
    public function free_grades(Request $request)
    {
        $request->validate([
            'subject_id' => 'required|exists:subjects,id',
            'grades'     => 'nullable|array|max:10',
            'grades.*'   => 'nullable|numeric|min:0|max:20',
        ]);

        $subjectId = $request->subject_id;
        $grades    = $request->grades ?? [];

        DB::transaction(function () use ($subjectId, $grades) {
            Grade::where('subject_id', $subjectId)
                ->where('type', 'libre')
                ->delete();

            foreach ($grades as $index => $score) {
                if ($score === null || $score === '') {
                    continue;
                }

                Grade::create([
                    'subject_id'   => $subjectId,
                    'type'         => 'libre',
                    'session'      => 0,
                    'score'        => $score,
                    'order_number' => $index + 1,
                ]);
            }
        });

        return response()->json([
            'message' => 'Notes libres sauvegardées avec succès',
            'count'   => count($grades),
        ]);
    }
}