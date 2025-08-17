<?php
/**
 * Cart API Endpoints
 * 
 * Handles shopping cart operations
 */

require_once '../config/config.php';
require_once '../config/database.php';
require_once '../models/Cart.php';
require_once '../middleware/AuthMiddleware.php';

// Initialize database connection
$database = new Database();
$db = $database->getConnection();

$cart = new Cart($db);

// Get HTTP method
$method = $_SERVER['REQUEST_METHOD'];

// Get request URI and extract endpoint
$request_uri = $_SERVER['REQUEST_URI'];
$path = parse_url($request_uri, PHP_URL_PATH);
$path_segments = explode('/', trim($path, '/'));

$endpoint = end($path_segments);

switch($method) {
    case 'GET':
        if($endpoint === 'cart') {
            getCart();
        } elseif($endpoint === 'total') {
            getCartTotal();
        } else {
            http_response_code(404);
            echo json_encode(['message' => 'Endpoint not found']);
        }
        break;
        
    case 'POST':
        if($endpoint === 'add') {
            addToCart();
        } else {
            http_response_code(404);
            echo json_encode(['message' => 'Endpoint not found']);
        }
        break;
        
    case 'PUT':
        if($endpoint === 'update') {
            updateCartItem();
        } else {
            http_response_code(404);
            echo json_encode(['message' => 'Endpoint not found']);
        }
        break;
        
    case 'DELETE':
        if($endpoint === 'remove') {
            removeFromCart();
        } elseif($endpoint === 'clear') {
            clearCart();
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
 * Get user's cart items
 */
function getCart() {
    global $cart;
    
    $user = AuthMiddleware::authenticate();
    $cart->user_id = $user['user_id'];
    
    $stmt = $cart->getCartItems();
    $num = $stmt->rowCount();

    if($num > 0) {
        $cart_items = array();
        
        while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            extract($row);
            
            $item = array(
                'id' => $id,
                'book' => array(
                    'id' => $book_id,
                    'title' => $title,
                    'author' => $author,
                    'price' => floatval($price),
                    'sale_price' => $sale_price ? floatval($sale_price) : null,
                    'current_price' => floatval($current_price),
                    'image' => $image,
                    'stock_quantity' => intval($stock_quantity),
                    'is_active' => boolval($is_active)
                ),
                'quantity' => intval($quantity),
                'item_total' => floatval($item_total),
                'added_at' => $created_at
            );
            
            array_push($cart_items, $item);
        }

        echo json_encode(array('cart_items' => $cart_items));
    } else {
        echo json_encode(array('cart_items' => array()));
    }
}

/**
 * Add item to cart
 */
function addToCart() {
    global $cart;
    
    $user = AuthMiddleware::authenticate();
    $data = json_decode(file_get_contents("php://input"));

    if(empty($data->book_id) || empty($data->quantity)) {
        http_response_code(400);
        echo json_encode(['message' => 'Book ID and quantity are required']);
        return;
    }

    if($data->quantity <= 0) {
        http_response_code(400);
        echo json_encode(['message' => 'Quantity must be greater than 0']);
        return;
    }

    $cart->user_id = $user['user_id'];
    $cart->book_id = $data->book_id;
    $cart->quantity = $data->quantity;

    if($cart->addItem()) {
        http_response_code(201);
        echo json_encode(['message' => 'Item added to cart successfully']);
    } else {
        http_response_code(500);
        echo json_encode(['message' => 'Failed to add item to cart']);
    }
}

/**
 * Update cart item quantity
 */
function updateCartItem() {
    global $cart;
    
    $user = AuthMiddleware::authenticate();
    $data = json_decode(file_get_contents("php://input"));

    if(empty($data->cart_item_id) || !isset($data->quantity)) {
        http_response_code(400);
        echo json_encode(['message' => 'Cart item ID and quantity are required']);
        return;
    }

    if($data->quantity <= 0) {
        http_response_code(400);
        echo json_encode(['message' => 'Quantity must be greater than 0']);
        return;
    }

    $cart->id = $data->cart_item_id;
    $cart->user_id = $user['user_id'];
    $cart->quantity = $data->quantity;

    if($cart->updateQuantity()) {
        echo json_encode(['message' => 'Cart item updated successfully']);
    } else {
        http_response_code(500);
        echo json_encode(['message' => 'Failed to update cart item']);
    }
}

/**
 * Remove item from cart
 */
function removeFromCart() {
    global $cart;
    
    $user = AuthMiddleware::authenticate();
    $data = json_decode(file_get_contents("php://input"));

    if(empty($data->cart_item_id)) {
        http_response_code(400);
        echo json_encode(['message' => 'Cart item ID is required']);
        return;
    }

    $cart->id = $data->cart_item_id;
    $cart->user_id = $user['user_id'];

    if($cart->removeItem()) {
        echo json_encode(['message' => 'Item removed from cart successfully']);
    } else {
        http_response_code(500);
        echo json_encode(['message' => 'Failed to remove item from cart']);
    }
}

/**
 * Clear entire cart
 */
function clearCart() {
    global $cart;
    
    $user = AuthMiddleware::authenticate();
    $cart->user_id = $user['user_id'];

    if($cart->clearCart()) {
        echo json_encode(['message' => 'Cart cleared successfully']);
    } else {
        http_response_code(500);
        echo json_encode(['message' => 'Failed to clear cart']);
    }
}

/**
 * Get cart total
 */
function getCartTotal() {
    global $cart;
    
    $user = AuthMiddleware::authenticate();
    $cart->user_id = $user['user_id'];
    
    $total = $cart->getCartTotal();
    
    echo json_encode([
        'cart_summary' => [
            'item_count' => intval($total['item_count']),
            'total_quantity' => intval($total['total_quantity']),
            'total_amount' => floatval($total['total_amount'])
        ]
    ]);
}
?>
