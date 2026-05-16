<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\RegisterSppgRequest;
use App\Models\Sppg;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    /**
     * Register a new SPPG account
     */
    public function register(RegisterSppgRequest $request)
    {
        try {
            $sppg = Sppg::create([
                'name' => $request->name,
                'email' => $request->email,
                'password' => Hash::make($request->password),
                'location' => $request->location ?? '',
                'province' => $request->province ?? '',
                'contact_person' => $request->contact_person,
                'phone' => $request->phone,
                'has_slhs' => false,
            ]);

            // Create token for the user (if using Sanctum)
            // $token = $sppg->createToken('auth_token')->plainTextToken;

            return response()->json([
                'success' => true,
                'message' => 'Registrasi berhasil! Silakan login.',
                'data' => [
                    'sppg' => [
                        'id' => $sppg->id,
                        'name' => $sppg->name,
                        'email' => $sppg->email,
                        'location' => $sppg->location,
                        'province' => $sppg->province,
                    ],
                    // 'token' => $token,
                ],
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Registrasi gagal.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Login SPPG account
     */
    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ], [
            'email.required' => 'Email wajib diisi.',
            'email.email' => 'Format email tidak valid.',
            'password.required' => 'Password wajib diisi.',
        ]);

        $sppg = Sppg::where('email', $request->email)->first();

        if (!$sppg || !Hash::check($request->password, $sppg->password)) {
            throw ValidationException::withMessages([
                'email' => ['Email atau password salah.'],
            ]);
        }

        // Create token for the user (if using Sanctum)
        // $token = $sppg->createToken('auth_token')->plainTextToken;

        return response()->json([
            'success' => true,
            'message' => 'Login berhasil!',
            'data' => [
                'sppg' => [
                    'id' => $sppg->id,
                    'name' => $sppg->name,
                    'email' => $sppg->email,
                    'location' => $sppg->location,
                    'province' => $sppg->province,
                    'contact_person' => $sppg->contact_person,
                    'phone' => $sppg->phone,
                ],
                // 'token' => $token,
            ],
        ]);
    }

    /**
     * Logout SPPG account
     */
    public function logout(Request $request)
    {
        // If using Sanctum
        // $request->user()->currentAccessToken()->delete();

        return response()->json([
            'success' => true,
            'message' => 'Logout berhasil!',
        ]);
    }

    /**
     * Get current authenticated SPPG
     */
    public function me(Request $request)
    {
        // If using Sanctum
        // $sppg = $request->user();

        // For now, return mock data or implement session-based auth
        return response()->json([
            'success' => true,
            'data' => [
                'sppg' => null, // Will be implemented with proper auth
            ],
        ]);
    }
}
