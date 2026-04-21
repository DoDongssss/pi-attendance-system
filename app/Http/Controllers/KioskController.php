<?php

namespace App\Http\Controllers;

use App\Models\AttendanceLog;
use App\Models\PersonOfInterest;
use App\Models\Schedule;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class KioskController extends Controller
{
    public function index()
    {
        return Inertia::render('Attendance/kiosk');
    }

    public function submit(Request $request)
    {
        $request->validate([
            'code' => ['required', 'string'],
        ]);

        $pi = PersonOfInterest::where('code', $request->code)
            ->whereNull('deleted_at')
            ->first();

        // PI not found
        if (!$pi) {
            return back()->with('kiosk', [
                'status'  => 'error',
                'message' => 'PI not found.',
                'detail'  => "No record matches code \"{$request->code}\".",
            ]);
        }

        // PI inactive
        if ($pi->status !== 'active') {
            return back()->with('kiosk', [
                'status'  => 'error',
                'message' => 'Inactive PI.',
                'detail'  => "{$pi->name} is currently inactive.",
            ]);
        }

        // Timeline check
        $today = Carbon::today();
        if ($pi->start_date && $today->lt(Carbon::parse($pi->start_date))) {
            return back()->with('kiosk', [
                'status'  => 'error',
                'message' => 'Not yet active.',
                'detail'  => "{$pi->name}'s monitoring starts on " . Carbon::parse($pi->start_date)->format('M d, Y') . '.',
            ]);
        }
        if ($pi->end_date && $today->gt(Carbon::parse($pi->end_date))) {
            return back()->with('kiosk', [
                'status'  => 'error',
                'message' => 'Monitoring ended.',
                'detail'  => "{$pi->name}'s monitoring ended on " . Carbon::parse($pi->end_date)->format('M d, Y') . '.',
            ]);
        }

        $todayStr = $today->toDateString();
        $now      = Carbon::now();

        // Get schedule — do this BEFORE the log check
        $scheduleData  = Schedule::getExpectedDays($pi->id, $now->month, $now->year);
        $lateThreshold = $scheduleData['late_threshold'] ?? '08:00:00';
        $isLate        = $now->format('H:i:s') > $lateThreshold;

        // Check if today is an expected day
        if (!in_array($todayStr, $scheduleData['dates'])) {
            return back()->with('kiosk', [
                'status'  => 'error',
                'message' => 'Not a scheduled day.',
                'detail'  => "{$pi->name} is not scheduled to attend today.",
            ]);
        }

        $log = AttendanceLog::where('pi_id', $pi->id)
            ->where('date', $todayStr)
            ->first();

        // Already completed
        if ($log && $log->check_out) {
            return back()->with('kiosk', [
                'status'  => 'error',
                'message' => 'Already completed.',
                'detail'  => "{$pi->name} has already checked in and out today.",
            ]);
        }

        if (!$log) {
            // Check-in
            $status = $isLate ? 'late' : 'present';
            AttendanceLog::create([
                'pi_id'        => $pi->id,
                'date'         => $todayStr,
                'check_in'     => $now->toTimeString(),
                'status'       => $status,
                'processed_by' => Auth::id(),
            ]);

            return back()->with('kiosk', [
                'status'    => 'success',
                'action'    => 'check-in',
                'badge'     => $isLate ? 'late' : 'present',
                'message'   => 'Checked In',
                'name'      => $pi->name,
                'code'      => $pi->code,
                'time'      => $now->format('h:i:s A'),
                'date'      => $now->format('F d, Y'),
                'threshold' => substr($lateThreshold, 0, 5),
            ]);
        }

        // Check-out
        $log->update(['check_out' => $now->toTimeString()]);

        return back()->with('kiosk', [
            'status'  => 'success',
            'action'  => 'check-out',
            'badge'   => $log->status,
            'message' => 'Checked Out',
            'name'    => $pi->name,
            'code'    => $pi->code,
            'time'    => $now->format('h:i:s A'),
            'date'    => $now->format('F d, Y'),
        ]);
    }
}