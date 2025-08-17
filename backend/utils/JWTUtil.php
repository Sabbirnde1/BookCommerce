<?php
/**
 * JWT Utility Class
 * 
 * Handles JWT token creation and verification
 */

class JWTUtil {
    
    /**
     * Generate JWT token
     */
    public static function generateToken($user_id, $email, $role) {
        $header = json_encode(['typ' => 'JWT', 'alg' => JWT_ALGORITHM]);
        $payload = json_encode([
            'user_id' => $user_id,
            'email' => $email,
            'role' => $role,
            'iat' => time(),
            'exp' => time() + (24 * 60 * 60) // 24 hours
        ]);

        $headerEncoded = self::base64UrlEncode($header);
        $payloadEncoded = self::base64UrlEncode($payload);

        $signature = hash_hmac('sha256', $headerEncoded . "." . $payloadEncoded, JWT_SECRET_KEY, true);
        $signatureEncoded = self::base64UrlEncode($signature);

        return $headerEncoded . "." . $payloadEncoded . "." . $signatureEncoded;
    }

    /**
     * Verify JWT token
     */
    public static function verifyToken($token) {
        $tokenParts = explode('.', $token);
        
        if (count($tokenParts) !== 3) {
            return false;
        }

        $header = self::base64UrlDecode($tokenParts[0]);
        $payload = self::base64UrlDecode($tokenParts[1]);
        $signatureProvided = $tokenParts[2];

        // Verify signature
        $signature = hash_hmac('sha256', $tokenParts[0] . "." . $tokenParts[1], JWT_SECRET_KEY, true);
        $signatureEncoded = self::base64UrlEncode($signature);

        if (!hash_equals($signatureEncoded, $signatureProvided)) {
            return false;
        }

        $payloadData = json_decode($payload, true);

        // Check if token is expired
        if ($payloadData['exp'] < time()) {
            return false;
        }

        return $payloadData;
    }

    /**
     * Get user from token
     */
    public static function getUserFromToken($token) {
        $payload = self::verifyToken($token);
        if ($payload) {
            return [
                'user_id' => $payload['user_id'],
                'email' => $payload['email'],
                'role' => $payload['role']
            ];
        }
        return false;
    }

    /**
     * Base64 URL encode
     */
    private static function base64UrlEncode($data) {
        return rtrim(strtr(base64_encode($data), '+/', '-_'), '=');
    }

    /**
     * Base64 URL decode
     */
    private static function base64UrlDecode($data) {
        return base64_decode(str_pad(strtr($data, '-_', '+/'), strlen($data) % 4, '=', STR_PAD_RIGHT));
    }
}
?>
