<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;

class RolesAndPermissionsSeeder extends Seeder
{
    public function run(): void
    {
        // Reset cached roles and permissions
        app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();

        // 1. Create all permissions
        $permissions = [
            'pi.view',
            'pi.create',
            'pi.update',
            'pi.delete',
            'attendance.checkin',
            'attendance.checkout',
            'attendance.view',
            'attendance.process',
            'report.view',
            'report.export',
        ];

        foreach ($permissions as $perm) {
            Permission::firstOrCreate(['name' => $perm]);
        }

        // 2. Create roles
        $adminRole = Role::firstOrCreate(['name' => 'admin']);
        $staffRole = Role::firstOrCreate(['name' => 'staff']);

        // 3. Assign permissions to roles
        $adminRole->syncPermissions(Permission::all());

        $staffRole->syncPermissions([
            'attendance.checkin',
            'attendance.checkout',
            'attendance.view',
        ]);

        $this->command->info('Roles and permissions seeded successfully.');
    }
}