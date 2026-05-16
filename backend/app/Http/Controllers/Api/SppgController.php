<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Sppg;
use Illuminate\Http\Request;

class SppgController extends Controller
{
    public function index()
    {
        $sppgs = Sppg::all();
        return response()->json([
            'success' => true,
            'data' => $sppgs
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'location' => 'required|string|max:255',
            'province' => 'required|string|max:100',
            'contact_person' => 'nullable|string',
            'phone' => 'nullable|string',
            'has_slhs' => 'boolean'
        ]);

        $sppg = Sppg::create($validated);

        return response()->json([
            'success' => true,
            'data' => $sppg,
            'message' => 'SPPG berhasil ditambahkan'
        ], 201);
    }
}