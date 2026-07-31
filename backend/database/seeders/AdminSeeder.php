<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\User;

class AdminSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        User::updateOrCreate(
            ['email'=> 'admin@admin.com'],
            [
                'name'=> 'admin',
                'email'=>'admin@admin.com',
                'phone'=>'1234567890',
                'password'=>bcrypt('password'),
                'role'=>'admin',
                'status'=>'active',
                'email_verified_at'=> now(),
            ]
        );
    }
}
