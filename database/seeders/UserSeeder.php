<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        $admin = User::firstOrCreate(
            ['email' => 'admin@local.dev'],
            [
                'name'     => 'Admin User',
                'password' => bcrypt('password'),
            ]
        );
        $admin->assignRole('admin');

        $staff = User::firstOrCreate(
            ['email' => 'staff@local.dev'],
            [
                'name'     => 'Staff User',
                'password' => bcrypt('password'),
            ]
        );
        $staff->assignRole('staff');

        $this->command->info('Default users seeded successfully.');
    }
}