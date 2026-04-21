<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Spatie\Activitylog\Models\Concerns\LogsActivity;
use Spatie\Activitylog\Support\LogOptions;

class AttendanceLog extends Model
{
    use SoftDeletes, LogsActivity;

    protected $fillable = [
        'pi_id',
        'date',
        'check_in',
        'check_out',
        'status',
        'processed_by',
        'notes',
    ];

    protected $casts = [
        'date' => 'date',
    ];

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logOnly(['status', 'check_in', 'check_out', 'processed_by'])
            ->logOnlyDirty()
            ->useLogName('attendance');
    }

    public function pi(): BelongsTo
    {
        return $this->belongsTo(PersonOfInterest::class, 'pi_id');
    }

    public function processedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'processed_by');
    }
}