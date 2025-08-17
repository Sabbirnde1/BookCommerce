<?php
/**
 * Authentication Middleware
 * 
 * Handles JWT token authentication for protected routes
 */

require_once '../utils/JWTUtil.php';

class AuthMiddleware {
    
    /**
     * Authenticate user from token
     */
    public static function authenticate() {
        $headers = getallheaders();
        $token = null;

        // Check for Authorization header
        if (isset($headers['Authorization'])) {
            $authHeader = $headers['Authorization'];
            if (preg_match('/Bearer\s+(.*)$/i', $authHeader, $matches)) {
                $token = $matches[1];
            }
        }

        if (!$token) {
            http_response_code(401);
            echo json_encode(['message' => 'Access denied. No token provided.']);
            exit;
        }

        $user = JWTUtil::getUserFromToken($token);
        
        if (!$user) {
            http_response_code(401);
            echo json_encode(['message' => 'Access denied. Invalid token.']);
            exit;
        }

        return $user;
    }

    /**
     * Check if user is admin
     */
    public static function requireAdmin() {
        $user = self::authenticate();
        
        if ($user['role'] !== 'admin') {
            http_response_code(403);
            echo json_encode(['message' => 'Access denied. Admin privileges required.']);
            exit;
        }

        return $user;
    }

    /**
     * Get current user (optional authentication)
     */
    public static function getCurrentUser() {
        $headers = getallheaders();
        $token = null;

        // Check for Authorization header
        if (isset($headers['Authorization'])) {
            $authHeader = $headers['Authorization'];
            if (preg_match('/Bearer\s+(.*)$/i', $authHeader, $matches)) {
                $token = $matches[1];
            }
        }

        if ($token) {
            return JWTUtil::getUserFromToken($token);
        }

        return null;
    }
}
?>
