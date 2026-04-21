<?php

namespace App\Http\Controllers;

use App\Models\AttendanceLog;
use App\Models\PersonOfInterest;
use App\Models\Schedule;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Carbon\Carbon;
use Illuminate\Support\Facades\Auth;

class ProcessingController extends Controller
{
    public function index(Request $request)
    {
        $date  = $request->date ?? Carbon::today()->toDateString();
        $month = Carbon::parse($date)->month;
        $year  = Carbon::parse($date)->year;

        // Get all active PIs expected on the selected date
        // who do NOT yet have an attendance record for that date
        $unprocessed = PersonOfInterest::where('status', 'active')
            ->orderBy('name')
            ->get()
            ->filter(function ($pi) use ($date, $month, $year) {
                $schedule    = Schedule::getExpectedDays($pi->id, $month, $year);
                $isExpected  = in_array($date, $schedule['dates']);
                $hasRecord   = AttendanceLog::where('pi_id', $pi->id)
                                   ->where('date', $date)
                                   ->exists();

                return $isExpected && !$hasRecord;
            })
            ->map(fn($pi) => [
                'id'   => $pi->id,
                'code' => $pi->code,
                'name' => $pi->name,
            ])
            ->values();

        // Already processed for the selected date
        $processed = AttendanceLog::with('pi:id,name,code')
            ->whereDate('date', $date)
            ->where('status', 'absent')
            ->whereNotNull('processed_by')
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(fn($log) => [
                'id'           => $log->id,
                'pi'           => $log->pi,
                'status'       => $log->status,
                'processed_by' => $log->processedBy?->name,
                'notes'        => $log->notes,
            ]);

        return Inertia::render('Processing/index', [
            'unprocessed' => $unprocessed,
            'processed'   => $processed,
            'selectedDate' => $date,
        ]);
    }

    public function process(Request $request)
    {
        $request->validate([
            'pi_ids' => ['required', 'array', 'min:1'],
            'pi_ids.*' => ['integer', 'exists:persons_of_interest,id'],
            'date'   => ['required', 'date'],
            'notes'  => ['nullable', 'string', 'max:500'],
        ]);

        $date = $request->date;

        foreach ($request->pi_ids as $piId) {
            // Skip if record already exists — safety guard
            $exists = AttendanceLog::where('pi_id', $piId)
                ->where('date', $date)
                ->exists();

            if ($exists) continue;

            $log = AttendanceLog::create([
                'pi_id'        => $piId,
                'date'         => $date,
                'check_in'     => null,
                'check_out'    => null,
                'status'       => 'absent',
                'processed_by' => Auth::id(),
                'notes'        => $request->notes,
            ]);

            // Audit log
            activity('processing')
                ->causedBy(Auth::user())
                ->performedOn($log)
                ->withProperties([
                    'pi_id'  => $piId,
                    'date'   => $date,
                    'status' => 'absent',
                ])
                ->log('Absence processed by admin');
        }

        return back()->with('success', 'Absences processed successfully.');
    }
}