<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Cache\RateLimiter;
use Symfony\Component\HttpFoundation\Response;

class RateLimitApi
{
    public function __construct(private RateLimiter $limiter)
    {
    }

    public function handle(Request $request, Closure $next): Response
    {
        $key = $this->resolveRequestSignature($request);

        // 60 requests per minute per IP
        if ($this->limiter->tooManyAttempts($key, 60)) {
            return response()->json([
                'success' => false,
                'message' => 'Terlalu banyak request. Silakan coba lagi dalam beberapa saat.',
            ], 429);
        }

        $this->limiter->hit($key, 60);

        return $next($request);
    }

    protected function resolveRequestSignature(Request $request): string
    {
        return sha1(implode('|', [
            $request->method(),
            $request->getHost(),
            $request->ip(),
        ]));
    }
}
