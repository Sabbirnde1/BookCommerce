<?php
/**
 * Authentication API Endpoints
 * 
 * Handles user registration, login, and profile management
 */

require_once '../config/config.php';
require_once '../config/database.php';
require_once '../models/User.php';
require_once '../utils/JWTUtil.php';
require_once '../middleware/AuthMiddleware.php';

// Initialize database connection
$database = new Database();
$db = $database->getConnection();

$user = new User($db);

// Get HTTP method
$method = $_SERVER['REQUEST_METHOD'];

// Get request URI and extract endpoint
$request_uri = $_SERVER['REQUEST_URI'];
$path = parse_url($request_uri, PHP_URL_PATH);
$path_segments = explode('/', trim($path, '/'));

// Extract endpoint (last segment)
$endpoint = end($path_segments);

switch($method) {
    case 'POST':
        if($endpoint === 'register') {
            register();
        } elseif($endpoint === 'login') {
            login();
        } else {
            http_response_code(404);
            echo json_encode(['message' => 'Endpoint not found']);
        }
        break;
        
    case 'GET':
        if($endpoint === 'profile') {
            getProfile();
        } elseif($endpoint === 'verify') {
            verifyToken();
        } else {
            http_response_code(404);
            echo json_encode(['message' => 'Endpoint not found']);
        }
        break;
        
    case 'PUT':
        if($endpoint === 'profile') {
            updateProfile();
        } else {
            http_response_code(404);
            echo json_encode(['message' => 'Endpoint not found']);
        }
        break;
        
    default:
        http_response_code(405);
        echo json_encode(['message' => 'Method not allowed']);
        break;
}

/**
 * User registration
 */
function register() {
    global $user;
    
    $data = json_decode(file_get_contents("php://input"));

    if(empty($data->username) || empty($data->email) || empty($data->password) || 
       empty($data->first_name) || empty($data->last_name)) {
        http_response_code(400);
        echo json_encode(['message' => 'All required fields must be provided']);
        return;
    }

    // Check if email already exists
    $user->email = $data->email;
    if($user->emailExists()) {
        http_response_code(409);
        echo json_encode(['message' => 'Email already exists']);
        return;
    }

    // Check if username already exists
    $user->username = $data->username;
    if($user->usernameExists()) {
        http_response_code(409);
        echo json_encode(['message' => 'Username already exists']);
        return;
    }

    // Set user properties
    $user->username = $data->username;
    $user->email = $data->email;
    $user->password = $data->password;
    $user->first_name = $data->first_name;
    $user->last_name = $data->last_name;
    $user->phone = $data->phone ?? null;
    $user->address = $data->address ?? null;
    $user->city = $data->city ?? null;
    $user->state = $data->state ?? null;
    $user->zip_code = $data->zip_code ?? null;
    $user->country = $data->country ?? null;
    $user->role = 'customer';

    if($user->create()) {
        http_response_code(201);
        echo json_encode(['message' => 'User registered successfully']);
    } else {
        http_response_code(500);
        echo json_encode(['message' => 'Failed to register user']);
    }
}

/**
 * User login
 */
function login() {
    global $user;
    
    $data = json_decode(file_get_contents("php://input"));

    if(empty($data->email) || empty($data->password)) {
        http_response_code(400);
        echo json_encode(['message' => 'Email and password are required']);
        return;
    }

    $user->email = $data->email;
    $user->password = $data->password;

    if($user->login()) {
        $token = JWTUtil::generateToken($user->id, $user->email, $user->role);
        
        http_response_code(200);
        echo json_encode([
            'message' => 'Login successful',
            'token' => $token,
            'user' => [
                'id' => $user->id,
                'username' => $user->username,
                'email' => $user->email,
                'first_name' => $user->first_name,
                'last_name' => $user->last_name,
                'role' => $user->role
            ]
        ]);
    } else {
        http_response_code(401);
        echo json_encode(['message' => 'Invalid credentials']);
    }
}

/**
 * Get user profile
 */
function getProfile() {
    global $user;
    
    $currentUser = AuthMiddleware::authenticate();
    
    $user->id = $currentUser['user_id'];
    
    if($user->readOne()) {
        echo json_encode([
            'user' => [
                'id' => $user->id,
                'username' => $user->username,
                'email' => $user->email,
                'first_name' => $user->first_name,
                'last_name' => $user->last_name,
                'phone' => $user->phone,
                'address' => $user->address,
                'city' => $user->city,
                'state' => $user->state,
                'zip_code' => $user->zip_code,
                'country' => $user->country,
                'role' => $user->role,
                'created_at' => $user->created_at
            ]
        ]);
    } else {
        http_response_code(404);
        echo json_encode(['message' => 'User not found']);
    }
}

/**
 * Update user profile
 */
function updateProfile() {
    global $user;
    
    $currentUser = AuthMiddleware::authenticate();
    $data = json_decode(file_get_contents("php://input"));

    if(empty($data->username) || empty($data->email) || empty($data->first_name) || empty($data->last_name)) {
        http_response_code(400);
        echo json_encode(['message' => 'All required fields must be provided']);
        return;
    }

    $user->id = $currentUser['user_id'];
    $user->username = $data->username;
    $user->email = $data->email;
    $user->first_name = $data->first_name;
    $user->last_name = $data->last_name;
    $user->phone = $data->phone ?? null;
    $user->address = $data->address ?? null;
    $user->city = $data->city ?? null;
    $user->state = $data->state ?? null;
    $user->zip_code = $data->zip_code ?? null;
    $user->country = $data->country ?? null;

    if($user->update()) {
        echo json_encode(['message' => 'Profile updated successfully']);
    } else {
        http_response_code(500);
        echo json_encode(['message' => 'Failed to update profile']);
    }
}

/**
 * Verify token
 */
function verifyToken() {
    $currentUser = AuthMiddleware::authenticate();
    
    echo json_encode([
        'valid' => true,
        'user' => [
            'id' => $currentUser['user_id'],
            'email' => $currentUser['email'],
            'role' => $currentUser['role']
        ]
    ]);
}
?>
