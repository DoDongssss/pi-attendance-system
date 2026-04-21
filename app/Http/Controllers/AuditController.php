<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Spatie\Activitylog\Models\Activity;

class AuditController extends Controller
{
    public function index(Request $request)
    {
        $logs = Activity::with('causer:id,name')
            ->when($request->log_name, fn($q) =>
                $q->where('log_name', $request->log_name)
            )
            ->when($request->causer_id, fn($q) =>
                $q->where('causer_id', $request->causer_id)
            )
            ->when($request->date_from, fn($q) =>
                $q->whereDate('created_at', '>=', $request->date_from)
            )
            ->when($request->date_to, fn($q) =>
                $q->whereDate('created_at', '<=', $request->date_to)
            )
            ->orderBy('created_at', 'desc')
            ->paginate(25)
            ->withQueryString();

        // Get all users for filter dropdown
        $users = \App\Models\User::orderBy('name')
            ->get(['id', 'name']);

        return Inertia::render('Audit/index', [
            'logs'    => $logs,
            'users'   => $users,
            'filters' => $request->only([
                'log_name', 'causer_id', 'date_from', 'date_to'
            ]),
        ]);
    }
}