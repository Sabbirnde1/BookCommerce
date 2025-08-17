<?php
/**
 * API Router
 * 
 * Routes API requests to appropriate endpoints
 */

require_once '../config/config.php';

// Get request URI and method
$request_uri = $_SERVER['REQUEST_URI'];
$path = parse_url($request_uri, PHP_URL_PATH);
$method = $_SERVER['REQUEST_METHOD'];

// Remove base path and get route segments
$base_path = '/BookCommerce/backend/api';
$route = str_replace($base_path, '', $path);
$segments = explode('/', trim($route, '/'));

// Route to appropriate endpoint
if(count($segments) > 0) {
    $endpoint = $segments[0];
    
    switch($endpoint) {
        case 'auth':
            require_once 'auth.php';
            break;
            
        case 'books':
            require_once 'books.php';
            break;
            
        case 'cart':
            require_once 'cart.php';
            break;
            
        case 'categories':
            require_once 'books.php'; // Categories are handled in books.php
            break;
            
        default:
            http_response_code(404);
            echo json_encode(['message' => 'API endpoint not found']);
            break;
    }
} else {
    // API info
    echo json_encode([
        'name' => 'BookCommerce API',
        'version' => '1.0.0',
        'description' => 'RESTful API for BookCommerce e-commerce platform',
        'endpoints' => [
            '/auth' => 'Authentication endpoints (login, register, profile)',
            '/books' => 'Book management endpoints',
            '/cart' => 'Shopping cart endpoints',
            '/categories' => 'Category endpoints'
        ],
        'documentation' => API_BASE_URL . '/docs'
    ]);
}
?>
