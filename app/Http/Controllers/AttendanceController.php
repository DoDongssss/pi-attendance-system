<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreCheckinRequest;
use App\Http\Requests\StoreCheckoutRequest;
use App\Models\AttendanceLog;
use App\Models\PersonOfInterest;
use App\Models\Schedule;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Carbon\Carbon;

class AttendanceController extends Controller
{
    public function index(Request $request)
    {
        $today = Carbon::today();
        $month = $request->month ?? $today->month;
        $year  = $request->year  ?? $today->year;
        $date  = $request->date  ?? $today->toDateString();

        // All active PIs with today's attendance log
        $pis = PersonOfInterest::where('status', 'active')
            ->orderBy('name')
            ->get()
            ->map(function ($pi) use ($date, $month, $year) {
                $log      = AttendanceLog::where('pi_id', $pi->id)
                                ->where('date', $date)
                                ->first();

                $schedule = Schedule::getExpectedDays($pi->id, (int) $month, (int) $year);
                $isExpectedToday = in_array($date, $schedule['dates']);

                return [
                    'id'               => $pi->id,
                    'code'             => $pi->code,
                    'name'             => $pi->name,
                    'is_expected'      => $isExpectedToday,
                    'is_fallback'      => $schedule['is_fallback'],
                    'late_threshold'   => $schedule['late_threshold'],
                    'log'              => $log ? [
                        'id'        => $log->id,
                        'check_in'  => $log->check_in,
                        'check_out' => $log->check_out,
                        'status'    => $log->status,
                        'notes'     => $log->notes,
                    ] : null,
                ];
            });

        // Attendance history — paginated
        $history = AttendanceLog::with('pi:id,name,code')
            ->when($request->pi_id, fn($q) => $q->where('pi_id', $request->pi_id))
            ->when($request->status, fn($q) => $q->where('status', $request->status))
            ->when($request->date_from, fn($q) => $q->whereDate('date', '>=', $request->date_from))
            ->when($request->date_to, fn($q) => $q->whereDate('date', '<=', $request->date_to))
            ->orderBy('date', 'desc')
            ->orderBy('created_at', 'desc')
            ->paginate(20)
            ->withQueryString();

        return Inertia::render('Attendance/index', [
            'pis'     => $pis,
            'history' => $history,
            'filters' => $request->only(['date', 'month', 'year', 'pi_id', 'status', 'date_from', 'date_to']),
            'today'   => $today->toDateString(),
            'piList'  => PersonOfInterest::where('status', 'active')
                            ->orderBy('name')
                            ->get(['id', 'name', 'code']),
        ]);
    }

    public function checkin(StoreCheckinRequest $request)
    {
        $today = Carbon::today()->toDateString();
        $now   = Carbon::now()->format('H:i:s');

        // Duplicate check
        $existing = AttendanceLog::where('pi_id', $request->pi_id)
            ->where('date', $today)
            ->first();

        if ($existing) {
            return back()->withErrors([
                'pi_id' => 'This PI has already checked in today.'
            ]);
        }

        // Determine status — present or late
        $schedule  = Schedule::getExpectedDays(
            $request->pi_id,
            (int) now()->month,
            (int) now()->year
        );

        $threshold = $schedule['late_threshold'] ?? '08:00:00';
        $status    = $now > $threshold ? 'late' : 'present';

        AttendanceLog::create([
            'pi_id'        => $request->pi_id,
            'date'         => $today,
            'check_in'     => $now,
            'status'       => $status,
            'processed_by' => null,
            'notes'        => $request->notes,
        ]);

        return back()->with('success', 'Check-in recorded successfully.');
    }

    public function checkout(StoreCheckoutRequest $request)
    {
        $today = Carbon::today()->toDateString();

        $log = AttendanceLog::where('pi_id', $request->pi_id)
            ->where('date', $today)
            ->first();

        // Must have checked in first
        if (!$log) {
            return back()->withErrors([
                'pi_id' => 'This PI has not checked in yet today.'
            ]);
        }

        // Already checked out
        if ($log->check_out) {
            return back()->withErrors([
                'pi_id' => 'This PI has already checked out today.'
            ]);
        }

        $log->update([
            'check_out' => Carbon::now()->format('H:i:s'),
            'notes'     => $request->notes ?? $log->notes,
        ]);

        return back()->with('success', 'Check-out recorded successfully.');
    }

    public function scan(string $code)
    {
        $pi = PersonOfInterest::where('code', $code)
            ->where('status', 'active')
            ->firstOrFail();

        $today = now()->toDateString();

        $log = AttendanceLog::where('pi_id', $pi->id)
            ->where('date', $today)
            ->first();

        if (!$log) {
            // Check-in
            AttendanceLog::create([
                'pi_id'    => $pi->id,
                'date'     => $today,
                'check_in' => now()->toTimeString(),
                'status'   => 'present',
            ]);
            return redirect()->route('attendance.index')
                ->with('success', "{$pi->name} checked in successfully.");
        }

        if (!$log->check_out) {
            // Check-out
            $log->update(['check_out' => now()->toTimeString()]);
            return redirect()->route('attendance.index')
                ->with('success', "{$pi->name} checked out successfully.");
        }

        return redirect()->route('attendance.index')
            ->with('error', "{$pi->name} has already completed attendance today.");
    }
}