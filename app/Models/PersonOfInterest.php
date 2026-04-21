<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Spatie\Activitylog\Models\Concerns\LogsActivity;
use Spatie\Activitylog\Support\LogOptions;

class PersonOfInterest extends Model
{
    use SoftDeletes, LogsActivity;

    protected $table = 'persons_of_interest';

    protected $fillable = [
        'code',
        'name',
        'alias',
        'identifying_marks',
        'date_of_birth',
        'sex',
        'civil_status',
        'spouse_name',
        'no_of_dependents',
        'address',
        'educational_attainment',
        'occupation',
        'monthly_income',
        'hobbies',
        'skills',
        'religious_affiliation',
        'sibling_rank',
        'sibling_male_count',
        'sibling_female_count',
        'status',
        'notes',

        //added column
        'start_date', 
        'end_date'
    ];

    protected $casts = [
        'date_of_birth'      => 'date',
        'monthly_income'     => 'decimal:2',
        'no_of_dependents'   => 'integer',
        'sibling_rank'       => 'integer',
        'sibling_male_count' => 'integer',
        'sibling_female_count' => 'integer',
    ];

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logOnly([
                'code', 'name', 'alias', 'identifying_marks',
                'date_of_birth', 'sex', 'civil_status', 'spouse_name',
                'no_of_dependents', 'address', 'educational_attainment',
                'occupation', 'monthly_income', 'hobbies', 'skills',
                'religious_affiliation', 'sibling_rank', 'sibling_male_count',
                'sibling_female_count', 'status', 'notes',
            ])
            ->logOnlyDirty()
            ->useLogName('pi');
    }

    public function schedules(): HasMany
    {
        return $this->hasMany(Schedule::class, 'pi_id');
    }

    public function attendanceLogs(): HasMany
    {
        return $this->hasMany(AttendanceLog::class, 'pi_id');
    }
}