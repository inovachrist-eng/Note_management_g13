<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\PasswordlessAuthController;
use App\Http\Controllers\Api\AcademicYearController;
use App\Http\Controllers\Api\SemesterController;
use App\Http\Controllers\Api\SubjectController;
use App\Http\Controllers\Api\CourseModuleController;
use App\Http\Controllers\Api\GradeController;

Route::post('/register', [AuthController::class, 'register']);

// Connexion sans mot de passe (magic link)
Route::post('/auth/magic-link',        [PasswordlessAuthController::class, 'send']);
Route::post('/auth/magic-link/verify', [PasswordlessAuthController::class, 'verify']);

Route::middleware('auth:sanctum')->group(function () {

    Route::post('/logout',    [AuthController::class, 'logout']);
    Route::get('/user',       [AuthController::class, 'user']);
    Route::get('/user-full',  [AuthController::class, 'userFull']);

    // ── Années académiques ──────────────────────────────────────────────────
    Route::post('/add_academic_years',    [AcademicYearController::class, 'add_academic_years']);
    Route::post('/mod_academic_years',    [AcademicYearController::class, 'mod_academic_years']);
    Route::post('/delete-academic-years', [AcademicYearController::class, 'delete_academic_years']);

    // ── Semestres ───────────────────────────────────────────────────────────
    Route::post('/add_semester',    [SemesterController::class, 'add_semester']);
    Route::post('/mod_semester',    [SemesterController::class, 'mod_semester']);
    Route::post('/delete_semester', [SemesterController::class, 'delete_semester']);
    Route::post('/change_semester', [SemesterController::class, 'change_semester']);

    // ── Modules ─────────────────────────────────────────────────────────────
    Route::post('/modules/add',          [CourseModuleController::class, 'add_module']);
    Route::post('/modules/update',       [CourseModuleController::class, 'mod_module']);
    Route::post('/modules/delete',       [CourseModuleController::class, 'delete_module']);
    Route::post('/modules/change-order', [CourseModuleController::class, 'change_module_order']);

    // ── Matières (Subjects) ─────────────────────────────────────────────────
    Route::post('/subjects/add',          [SubjectController::class, 'add_subject']);
    Route::post('/subjects/update',       [SubjectController::class, 'mod_subject']);
    Route::post('/subjects/delete',       [SubjectController::class, 'delete_subject']);
    Route::post('/subjects/change-order', [SubjectController::class, 'change_subject_order']);

    // ── Notes (Grades) ──────────────────────────────────────────────────────
    Route::post('/grades/add',          [GradeController::class, 'add_grade']);
    Route::post('/grades/update',       [GradeController::class, 'mod_grade']);
    Route::post('/grades/delete',       [GradeController::class, 'delete_grade']);
    Route::post('/grades/change-order', [GradeController::class, 'change_grade_order']);

    // Notes libres (contrôle continu, TD, TP — colonnes N1 à N10)
    Route::post('/grades/free',         [GradeController::class, 'free_grades']);
});