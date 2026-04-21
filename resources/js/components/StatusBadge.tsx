type Status = 'present' | 'absent' | 'late' | 'half_day' | 'active' | 'inactive';

interface Props {
    status: Status;
}

const styles: Record<Status, string> = {
    present:  'bg-green-100 text-green-700',
    absent:   'bg-red-100 text-red-700',
    late:     'bg-yellow-100 text-yellow-700',
    half_day: 'bg-blue-100 text-blue-700',
    active:   'bg-green-100 text-green-700',
    inactive: 'bg-gray-100 text-gray-600',
};

const labels: Record<Status, string> = {
    present:  'Present',
    absent:   'Absent',
    late:     'Late',
    half_day: 'Half Day',
    active:   'Active',
    inactive: 'Inactive',
};

export default function StatusBadge({ status }: Props) {
    return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[status]}`}>
            {labels[status]}
        </span>
    );
}