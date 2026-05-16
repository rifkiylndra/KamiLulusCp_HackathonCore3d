<?php

namespace App\Http\Controllers\Api;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use App\Models\Sppg;

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
            'name' => 'required|string',
            'location' => 'required|string',
            'province' => 'required|string',
            'contact_person' => 'nullable|string',
            'phone' => 'nullable|string',
        ]);

        $sppg = Sppg::create($validated);

        return response()->json([
            'success' => true,
            'data' => $sppg,
            'message' => 'SPPG berhasil ditambahkan'
        ], 201);
    }
}