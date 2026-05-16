<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Cross-Origin Resource Sharing (CORS) Configuration
    |--------------------------------------------------------------------------
    |
    | Here you may configure CORS settings for your application. This
    | configuration is used by the HandleCors middleware to determine
    | which cross-origin requests to allow.
    |
    */

    'paths' => ['api/*', 'sanctum/csrf-cookie'],

    'allowed_methods' => ['*'],

    'allowed_origins' => [
        'http://localhost:3000',
        'http://localhost:3001',
        'http://localhost:8080',
        'http://127.0.0.1:3000',
        'http://127.0.0.1:3001',
        'http://127.0.0.1:8080',
        'http://127.0.0.1:5173',
        // Vercel domains
        'https://*.vercel.app',
        // Development
        env('FRONTEND_URL', 'http://localhost:3000'),
    ],

    'allowed_headers' => ['*'],

    'exposed_headers' => [],

    'max_age' => 0,

    'supports_credentials' => true,

];
