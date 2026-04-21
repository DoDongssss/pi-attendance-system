<?php

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Schedule extends Model
{
    protected $fillable = [
        'pi_id',
        'month',
        'year',
        'expected_days',
        'late_threshold',
    ];

    protected $casts = [
        'expected_days' => 'array',
        'month'         => 'integer',
        'year'          => 'integer',
    ];

    public function pi(): BelongsTo
    {
        return $this->belongsTo(PersonOfInterest::class, 'pi_id');
    }

    /**
     * Get expected days for a PI in a given month/year.
     * Falls back to all weekdays (Mon–Fri) if no schedule defined.
     *
     * @return array{dates: string[], is_fallback: bool, late_threshold: string}
     */
    public static function getExpectedDays(int $piId, int $month, int $year): array
    {
        $schedule = self::where('pi_id', $piId)
            ->where('month', $month)
            ->where('year', $year)
            ->first();

        if ($schedule) {
            return [
                'dates'          => $schedule->expected_days,
                'is_fallback'    => false,
                'late_threshold' => $schedule->late_threshold,
            ];
        }

        // Fallback: all weekdays of the month
        $dates = [];
        $start = Carbon::createFromDate($year, $month, 1)->startOfMonth();
        $end   = $start->copy()->endOfMonth();

        for ($day = $start->copy(); $day->lte($end); $day->addDay()) {
            if ($day->isWeekday()) {
                $dates[] = $day->toDateString();
            }
        }

        return [
            'dates'          => $dates,
            'is_fallback'    => true,
            'late_threshold' => '08:00:00',
        ];
    }
}