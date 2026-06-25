<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\CourseModule;
use App\Models\Semester;
use Illuminate\Support\Facades\DB;

class CourseModuleController extends Controller
{
    // ─────────────────────────────────────────────────────────────────────────
    // ➕  AJOUTER UN MODULE  (order_number auto-incrémenté)
    // ─────────────────────────────────────────────────────────────────────────
    public function add_module(Request $request)
    {
        $request->validate([
            'semester_id' => 'required|exists:semesters,id',
            'name'        => 'required|string|max:225',
            'credits'     => 'required|integer|min:1',
        ]);

        $semester = Semester::findOrFail($request->semester_id);

        // Auto-incrément : récupère le max existant pour ce semestre
        $maxOrder = CourseModule::where('semester_id', $semester->id)
            ->max('order_number') ?? 0;

        $module = CourseModule::create([
            'semester_id'  => $semester->id,
            'name'         => $request->name,
            'credits'      => $request->credits,
            'order_number' => $maxOrder + 1,
        ]);

        return response()->json([
            'message' => 'Module ajouté avec succès',
            'data'    => $module,
        ], 201);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // ✏️  MODIFIER UN MODULE
    // ─────────────────────────────────────────────────────────────────────────
    public function mod_module(Request $request)
    {
        $request->validate([
            'id'      => 'required|exists:modules,id',
            'name'    => 'sometimes|string|max:225',
            'credits' => 'sometimes|integer|min:1',
        ]);

        $module = CourseModule::findOrFail($request->id);

        $module->update($request->only(['name', 'credits']));

        return response()->json([
            'message' => 'Module modifié avec succès',
            'data'    => $module,
        ]);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // 🗑  SUPPRIMER UN MODULE  (réordonne les suivants)
    // ─────────────────────────────────────────────────────────────────────────
    public function delete_module(Request $request)
    {
        $request->validate([
            'id' => 'required|exists:modules,id',
        ]);

        $module = CourseModule::findOrFail($request->id);

        $semesterId   = $module->semester_id;
        $deletedOrder = $module->order_number;

        $module->delete();

        // Décrémente l'ordre des modules suivants
        CourseModule::where('semester_id', $semesterId)
            ->where('order_number', '>', $deletedOrder)
            ->decrement('order_number');

        return response()->json([
            'message' => 'Module supprimé avec succès',
        ]);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // 🔁  CHANGER L'ORDRE D'UN MODULE  (swap propre)
    // ─────────────────────────────────────────────────────────────────────────
    public function change_module_order(Request $request)
    {
        $request->validate([
            'id'           => 'required|exists:modules,id',
            'order_number' => 'required|integer|min:1',
        ]);

        $module = CourseModule::findOrFail($request->id);

        $oldOrder = $module->order_number;
        $newOrder = $request->order_number;

        if ($oldOrder === $newOrder) {
            return response()->json(['message' => 'Aucun changement']);
        }

        DB::transaction(function () use ($module, $oldOrder, $newOrder) {
            if ($newOrder < $oldOrder) {
                CourseModule::where('semester_id', $module->semester_id)
                    ->whereBetween('order_number', [$newOrder, $oldOrder - 1])
                    ->increment('order_number');
            } else {
                CourseModule::where('semester_id', $module->semester_id)
                    ->whereBetween('order_number', [$oldOrder + 1, $newOrder])
                    ->decrement('order_number');
            }

            $module->update(['order_number' => $newOrder]);
        });

        return response()->json([
            'message' => 'Ordre du module modifié avec succès',
            'data'    => $module->fresh(),
        ]);
    }
}