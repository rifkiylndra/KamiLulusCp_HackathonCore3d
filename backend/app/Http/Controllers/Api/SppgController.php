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
            'name' => 'required|string|max:255|unique:sppg,name',
            'location' => 'required|string|max:255',
            'province' => 'required|string|max:100',
            'contact_person' => 'nullable|string|max:255',
            'phone' => 'nullable|string|max:20',
            'has_slhs' => 'boolean'
        ]);

        $sppg = Sppg::create($validated);

        return response()->json([
            'success' => true,
            'data' => $sppg,
            'message' => 'SPPG berhasil ditambahkan'
        ], 201);
    }

    public function show(int $id)
    {
        $sppg = Sppg::with('mealSubmissions')->findOrFail($id);
        
        return response()->json([
            'success' => true,
            'data' => $sppg
        ]);
    }

    public function update(int $id, Request $request)
    {
        $sppg = Sppg::findOrFail($id);

        $validated = $request->validate([
            'name' => 'sometimes|string|max:255|unique:sppg,name,'.$id,
            'location' => 'sometimes|string|max:255',
            'province' => 'sometimes|string|max:100',
            'contact_person' => 'nullable|string|max:255',
            'phone' => 'nullable|string|max:20',
            'has_slhs' => 'sometimes|boolean'
        ]);

        $sppg->update($validated);

        return response()->json([
            'success' => true,
            'data' => $sppg,
            'message' => 'SPPG berhasil diupdate'
        ]);
    }

    public function destroy(int $id)
    {
        $sppg = Sppg::findOrFail($id);

        // Check if SPPG has submissions
        if ($sppg->mealSubmissions()->exists()) {
            return response()->json([
                'success' => false,
                'message' => 'Tidak bisa menghapus SPPG yang memiliki submission'
            ], 422);
        }

        $sppg->delete();

        return response()->json([
            'success' => true,
            'message' => 'SPPG berhasil dihapus'
        ]);
    }
}