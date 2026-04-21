<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreScheduleRequest;
use App\Http\Requests\UpdateScheduleRequest;
use App\Models\PersonOfInterest;
use App\Models\Schedule;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class ScheduleController extends Controller
{
    public function index(Request $request)
    {
        $pis = PersonOfInterest::where('status', 'active')
            ->orderBy('name')
            ->get(['id', 'name', 'code']);

        $selectedPiId = $request->pi_id;
        $month        = $request->month ?? now()->month;
        $year         = $request->year  ?? now()->year;

        $scheduleDates   = null;
        $lateThreshold   = '08:00:00';
        $isFallback      = false;
        $scheduleId      = null;

        if ($selectedPiId) {
            $result        = Schedule::getExpectedDays((int) $selectedPiId, (int) $month, (int) $year);
            $scheduleDates = $result['dates'];
            $lateThreshold = $result['late_threshold'];
            $isFallback    = $result['is_fallback'];

            $existing      = Schedule::where('pi_id', $selectedPiId)
                                    ->where('month', $month)
                                    ->where('year', $year)
                                    ->first();
            $scheduleId    = $existing?->id;
        }

        return Inertia::render('Schedules/index', [
            'pis'            => $pis,
            'scheduleDates'  => $scheduleDates,
            'lateThreshold'  => $lateThreshold,
            'scheduleId'     => $scheduleId,
            'isFallback'     => $isFallback,
            'filters'        => [
                'pi_id' => $selectedPiId,
                'month' => (int) $month,
                'year'  => (int) $year,
            ],
        ]);
    }

    public function store(StoreScheduleRequest $request)
    {
        Schedule::create($request->validated());

        Log::info('Schedule saved successfully.', [$request->validated()]);

        return back()->with('success', 'Schedule saved successfully.');
    }

    public function update(UpdateScheduleRequest $request, Schedule $schedule)
    {
        $schedule->update($request->validated());
        return back()->with('success', 'Schedule updated successfully.');
    }
}