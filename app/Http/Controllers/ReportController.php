<?php

namespace App\Http\Controllers;

use App\Models\AttendanceLog;
use App\Models\PersonOfInterest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class ReportController extends Controller
{
    public function index(Request $request)
    {
        $month = $request->month ?? now()->month;
        $year  = $request->year  ?? now()->year;
        $piId  = $request->pi_id;

        $query = DB::table('attendance_logs')
            ->join('persons_of_interest', 'attendance_logs.pi_id', '=', 'persons_of_interest.id')
            ->whereNull('attendance_logs.deleted_at')
            ->whereNull('persons_of_interest.deleted_at')
            ->whereMonth('attendance_logs.date', $month)
            ->whereYear('attendance_logs.date', $year)
            ->when($piId, fn($q) => $q->where('attendance_logs.pi_id', $piId))
            ->select(
                'persons_of_interest.id as pi_id',
                'persons_of_interest.name as pi_name',
                'persons_of_interest.code as pi_code',
                DB::raw("SUM(CASE WHEN attendance_logs.status = 'present'  THEN 1 ELSE 0 END) as present_count"),
                DB::raw("SUM(CASE WHEN attendance_logs.status = 'absent'   THEN 1 ELSE 0 END) as absent_count"),
                DB::raw("SUM(CASE WHEN attendance_logs.status = 'late'     THEN 1 ELSE 0 END) as late_count"),
                DB::raw("SUM(CASE WHEN attendance_logs.status = 'half_day' THEN 1 ELSE 0 END) as half_day_count"),
                DB::raw('COUNT(*) as total_days')
            )
            ->groupBy(
                'persons_of_interest.id',
                'persons_of_interest.name',
                'persons_of_interest.code'
            )
            ->orderBy('persons_of_interest.name');

        $summary = $query->paginate(20)->withQueryString();

        return Inertia::render('Reports/index', [
            'summary' => $summary,
            'filters' => [
                'month' => (int) $month,
                'year'  => (int) $year,
                'pi_id' => $piId,
            ],
            'piList' => PersonOfInterest::where('status', 'active')
                ->orderBy('name')
                ->get(['id', 'name', 'code']),
        ]);
    }

    public function export(Request $request)
    {
        $request->validate([
            'month' => ['required', 'integer', 'min:1', 'max:12'],
            'year'  => ['required', 'integer', 'min:2020', 'max:2100'],
            'pi_id' => ['nullable', 'integer', 'exists:persons_of_interest,id'],
        ]);

        $month = $request->month;
        $year  = $request->year;
        $piId  = $request->pi_id;

        $rows = DB::table('attendance_logs')
            ->join('persons_of_interest', 'attendance_logs.pi_id', '=', 'persons_of_interest.id')
            ->whereNull('attendance_logs.deleted_at')
            ->whereNull('persons_of_interest.deleted_at')
            ->whereMonth('attendance_logs.date', $month)
            ->whereYear('attendance_logs.date', $year)
            ->when($piId, fn($q) => $q->where('attendance_logs.pi_id', $piId))
            ->select(
                'persons_of_interest.code as pi_code',
                'persons_of_interest.name as pi_name',
                'attendance_logs.date',
                'attendance_logs.check_in',
                'attendance_logs.check_out',
                'attendance_logs.status',
                'attendance_logs.notes'
            )
            ->orderBy('persons_of_interest.name')
            ->orderBy('attendance_logs.date')
            ->get();

        // Build CSV
        $monthName = \Carbon\Carbon::createFromDate($year, $month, 1)->format('F_Y');
        $filename  = "attendance_report_{$monthName}.csv";

        $headers = [
            'Content-Type'        => 'text/csv',
            'Content-Disposition' => "attachment; filename=\"{$filename}\"",
        ];

        $callback = function () use ($rows) {
            $handle = fopen('php://output', 'w');

            // CSV Header row
            fputcsv($handle, [
                'PI Code', 'PI Name', 'Date',
                'Check In', 'Check Out', 'Status', 'Notes',
            ]);

            foreach ($rows as $row) {
                fputcsv($handle, [
                    $row->pi_code,
                    $row->pi_name,
                    $row->date,
                    $row->check_in  ?? '',
                    $row->check_out ?? '',
                    $row->status,
                    $row->notes     ?? '',
                ]);
            }

            fclose($handle);
        };

        return response()->stream($callback, 200, $headers);
    }
}