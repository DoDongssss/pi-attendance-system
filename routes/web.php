<?php

use App\Http\Controllers\AttendanceController;
use App\Http\Controllers\AuditController;
use App\Http\Controllers\KioskController;
use App\Http\Controllers\PIController;
use App\Http\Controllers\ProcessingController;
use App\Http\Controllers\ReportController;
use App\Http\Controllers\ScheduleController;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;

// Home — redirect to attendance dashboard if logged in
Route::get('/', function () {
    return Auth::check()
        ? redirect()->route('attendance.index')
        : redirect()->route('login');
})->name('home');

// Protected routes
Route::middleware(['auth', 'verified'])->group(function () {

    // Dashboard (keep Breeze default, we'll replace later)
    Route::inertia('dashboard', 'dashboard')->name('dashboard');

    // PI Management
    Route::get('/pi', [PIController::class, 'index'])
        ->middleware('permission:pi.view')
        ->name('pi.index');
    Route::post('/pi', [PIController::class, 'store'])
        ->middleware('permission:pi.create')
        ->name('pi.store');
    Route::put('/pi/{pi}', [PIController::class, 'update'])
        ->middleware('permission:pi.update')
        ->name('pi.update');
    Route::delete('/pi/{pi}', [PIController::class, 'destroy'])
        ->middleware('permission:pi.delete')
        ->name('pi.destroy');
    Route::post('/pi/{pi}/restore', [PIController::class, 'restore'])
        ->middleware('permission:pi.update')
        ->name('pi.restore');

    Route::get('/schedules', [ScheduleController::class, 'index'])
        ->middleware('permission:pi.view')
        ->name('schedules.index');

    Route::post('/schedules', [ScheduleController::class, 'store'])
        ->middleware('permission:attendance.process')
        ->name('schedules.store');

    Route::put('/schedules/{schedule}', [ScheduleController::class, 'update'])
        ->middleware('permission:attendance.process') 
        ->name('schedules.update');

    // Attendance — process route must come BEFORE the generic attendance routes
    Route::get('/attendance/process', [ProcessingController::class, 'index'])
        ->middleware('permission:attendance.process')
        ->name('processing.index');
    Route::post('/attendance/process', [ProcessingController::class, 'process'])
        ->middleware('permission:attendance.process')
        ->name('processing.process');

    Route::get('/attendance', [AttendanceController::class, 'index'])
        ->middleware('permission:attendance.view')
        ->name('attendance.index');
    Route::post('/attendance/checkin', [AttendanceController::class, 'checkin'])
        ->middleware('permission:attendance.checkin')
        ->name('attendance.checkin');
    Route::post('/attendance/checkout', [AttendanceController::class, 'checkout'])
        ->middleware('permission:attendance.checkout')
        ->name('attendance.checkout');
    Route::get('/attendance/scan/{code}', [AttendanceController::class, 'scan'])
        ->middleware('auth')
        ->name('attendance.scan');

    Route::middleware(['auth'])->group(function () {
    Route::get('/attendance/kiosk', [KioskController::class, 'index'])
        ->name('attendance.kiosk');
    Route::post('/attendance/kiosk', [KioskController::class, 'submit'])
        ->name('attendance.kiosk.submit');
});

    // Reports
    Route::get('/reports', [ReportController::class, 'index'])
        ->middleware('permission:report.view')
        ->name('reports.index');
    Route::get('/reports/export', [ReportController::class, 'export'])
        ->middleware('permission:report.export')
        ->name('reports.export');

    // Audit Log
    Route::get('/audit', [AuditController::class, 'index'])
        ->middleware('role:admin')
        ->name('audit.index');
});

require __DIR__.'/settings.php';