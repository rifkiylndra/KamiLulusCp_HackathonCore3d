<?php

namespace App\Support;

/**
 * Parser JSON respons Gemini — port dari app.js (balanceJson, fixUnterminatedString).
 */
class GeminiJsonParser
{
    public static function parse(string $txt): array
    {
        // Remove markdown code blocks
        $raw = trim(preg_replace('/```json|```/', '', $txt));
        if ($raw === '') {
            return [];
        }

        // Clean control characters that might break JSON parsing
        $raw = self::cleanControlCharacters($raw);

        try {
            return json_decode($raw, true, 512, JSON_THROW_ON_ERROR);
        } catch (\JsonException $e) {
            if (preg_match('/(\{[\s\S]*\}|\[[\s\S]*\])/u', $raw, $match)) {
                $candidate = $match[0];
                try {
                    return json_decode($candidate, true, 512, JSON_THROW_ON_ERROR);
                } catch (\JsonException) {
                    $fixed = self::balanceJson(self::fixUnterminatedString($candidate));
                    return json_decode($fixed, true, 512, JSON_THROW_ON_ERROR);
                }
            }
            throw $e;
        }
    }

    /**
     * Clean control characters from JSON string that might break parsing
     */
    private static function cleanControlCharacters(string $raw): string
    {
        // First, try to clean the entire string of problematic characters
        $cleaned = preg_replace('/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/', '', $raw);
        
        // Replace unescaped newlines and tabs in JSON strings
        $result = '';
        $inString = false;
        $escaped = false;
        $length = strlen($cleaned);
        
        for ($i = 0; $i < $length; $i++) {
            $ch = $cleaned[$i];
            
            if ($escaped) {
                $result .= $ch;
                $escaped = false;
                continue;
            }
            
            if ($ch === '\\') {
                $result .= $ch;
                $escaped = true;
                continue;
            }
            
            if ($ch === '"') {
                $result .= $ch;
                $inString = !$inString;
                continue;
            }
            
            // If we're inside a string, escape problematic characters
            if ($inString) {
                if ($ch === "\n") {
                    $result .= "\\n";
                    continue;
                } elseif ($ch === "\r") {
                    $result .= "\\r";
                    continue;
                } elseif ($ch === "\t") {
                    $result .= "\\t";
                    continue;
                }
            }
            
            $result .= $ch;
        }
        
        return $result;
    }

    private static function fixUnterminatedString(string $raw): string
    {
        $inString = false;
        $escaped = false;
        foreach (str_split($raw) as $ch) {
            if ($escaped) {
                $escaped = false;
                continue;
            }
            if ($ch === '\\') {
                $escaped = true;
                continue;
            }
            if ($ch === '"') {
                $inString = ! $inString;
            }
        }

        return $inString ? $raw.'"' : $raw;
    }

    private static function balanceJson(string $raw): string
    {
        $stack = [];
        $inString = false;
        $escaped = false;

        foreach (str_split($raw) as $ch) {
            if ($inString) {
                if ($escaped) {
                    $escaped = false;
                    continue;
                }
                if ($ch === '\\') {
                    $escaped = true;
                    continue;
                }
                if ($ch === '"') {
                    $inString = false;
                }
                continue;
            }
            if ($ch === '"') {
                $inString = true;
                continue;
            }
            if ($ch === '{' || $ch === '[') {
                $stack[] = $ch;
            } elseif ($ch === '}' || $ch === ']') {
                $last = $stack[count($stack) - 1] ?? null;
                if (($last === '{' && $ch === '}') || ($last === '[' && $ch === ']')) {
                    array_pop($stack);
                }
            }
        }

        $out = $raw;
        while (count($stack) > 0) {
            $opener = array_pop($stack);
            $out .= $opener === '{' ? '}' : ']';
        }

        return $out;
    }
}
