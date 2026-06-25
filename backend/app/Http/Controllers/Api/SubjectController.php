<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Subject;
use App\Models\CourseModule;
use Illuminate\Support\Facades\DB;

class SubjectController extends Controller
{
    // ─────────────────────────────────────────────────────────────────────────
    // ➕  AJOUTER UNE MATIÈRE  (order_number auto-incrémenté)
    // ─────────────────────────────────────────────────────────────────────────
    public function add_subject(Request $request)
    {
        $request->validate([
            'module_id' => 'required|exists:modules,id',
            'name'      => 'required|string|max:225',
        ]);

        $module = CourseModule::findOrFail($request->module_id);

        // Auto-incrément : récupère le max existant pour ce module
        $maxOrder = Subject::where('module_id', $module->id)
            ->max('order_number') ?? 0;

        $subject = Subject::create([
            'module_id'    => $module->id,
            'name'         => $request->name,
            'order_number' => $maxOrder + 1,
        ]);

        return response()->json([
            'message' => 'Matière ajoutée avec succès',
            'data'    => $subject,
        ], 201);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // ✏️  MODIFIER UNE MATIÈRE
    // ─────────────────────────────────────────────────────────────────────────
    public function mod_subject(Request $request)
    {
        $request->validate([
            'id'   => 'required|exists:subjects,id',
            'name' => 'required|string|max:225',
        ]);

        $subject = Subject::findOrFail($request->id);

        $subject->update(['name' => $request->name]);

        return response()->json([
            'message' => 'Matière modifiée avec succès',
            'data'    => $subject,
        ]);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // 🗑  SUPPRIMER UNE MATIÈRE  (réordonne les suivantes)
    // ─────────────────────────────────────────────────────────────────────────
    public function delete_subject(Request $request)
    {
        $request->validate([
            'id' => 'required|exists:subjects,id',
        ]);

        $subject = Subject::findOrFail($request->id);

        $moduleId     = $subject->module_id;
        $deletedOrder = $subject->order_number;

        $subject->delete();

        // Décrémente l'ordre des matières suivantes
        Subject::where('module_id', $moduleId)
            ->where('order_number', '>', $deletedOrder)
            ->decrement('order_number');

        return response()->json([
            'message' => 'Matière supprimée avec succès',
        ]);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // 🔁  CHANGER L'ORDRE D'UNE MATIÈRE  (swap propre)
    // ─────────────────────────────────────────────────────────────────────────
    public function change_subject_order(Request $request)
    {
        $request->validate([
            'id'           => 'required|exists:subjects,id',
            'order_number' => 'required|integer|min:1',
        ]);

        $subject = Subject::findOrFail($request->id);

        $oldOrder = $subject->order_number;
        $newOrder = $request->order_number;

        if ($oldOrder === $newOrder) {
            return response()->json(['message' => 'Aucun changement']);
        }

        DB::transaction(function () use ($subject, $oldOrder, $newOrder) {
            if ($newOrder < $oldOrder) {
                Subject::where('module_id', $subject->module_id)
                    ->whereBetween('order_number', [$newOrder, $oldOrder - 1])
                    ->increment('order_number');
            } else {
                Subject::where('module_id', $subject->module_id)
                    ->whereBetween('order_number', [$oldOrder + 1, $newOrder])
                    ->decrement('order_number');
            }

            $subject->update(['order_number' => $newOrder]);
        });

        return response()->json([
            'message' => 'Ordre de la matière modifié avec succès',
            'data'    => $subject->fresh(),
        ]);
    }
}