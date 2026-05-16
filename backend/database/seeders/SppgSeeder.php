<?php

namespace Database\Seeders;

use App\Models\Sppg;
use Illuminate\Database\Seeder;

class SppgSeeder extends Seeder
{
    public function run(): void
    {
        Sppg::create([
            'name' => 'SPPG Hub 01 - Jakarta Pusat',
            'location' => 'Jakarta Pusat',
            'province' => 'DKI Jakarta',
            'contact_person' => 'Ibu Siti',
            'phone' => '021-1234567',
            'has_slhs' => true,
        ]);

        Sppg::create([
            'name' => 'SPPG Hub 02 - Jakarta Selatan',
            'location' => 'Jakarta Selatan',
            'province' => 'DKI Jakarta',
            'contact_person' => 'Bapak Ahmad',
            'phone' => '021-7654321',
            'has_slhs' => true,
        ]);

        Sppg::create([
            'name' => 'SPPG Hub 03 - Jakarta Timur',
            'location' => 'Jakarta Timur',
            'province' => 'DKI Jakarta',
            'contact_person' => 'Ibu Rina',
            'phone' => '021-5555555',
            'has_slhs' => false,
        ]);

        Sppg::create([
            'name' => 'SPPG Hub 04 - Jakarta Barat',
            'location' => 'Jakarta Barat',
            'province' => 'DKI Jakarta',
            'contact_person' => 'Bapak Rudi',
            'phone' => '021-9999999',
            'has_slhs' => true,
        ]);
    }
}
