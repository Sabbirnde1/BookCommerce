<?php
/**
 * API Configuration
 * 
 * This file contains general API configuration settings
 */

// CORS headers
header("Access-Control-Allow-Origin: http://localhost:8080");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST, GET, PUT, DELETE, OPTIONS");
header("Access-Control-Max-Age: 3600");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Error reporting
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Timezone
date_default_timezone_set('UTC');

// JWT Secret Key - Change this in production!
define('JWT_SECRET_KEY', 'your-secret-key-change-in-production');
define('JWT_ALGORITHM', 'HS256');

// API Base URL
define('API_BASE_URL', 'http://localhost/BookCommerce/backend/api');

// Upload paths
define('UPLOAD_PATH', '../uploads/');
define('MAX_FILE_SIZE', 5 * 1024 * 1024); // 5MB
?>
