<?php
/**
 * Books API Endpoints
 * 
 * Handles book-related operations
 */

require_once '../config/config.php';
require_once '../config/database.php';
require_once '../models/Book.php';
require_once '../models/Category.php';
require_once '../middleware/AuthMiddleware.php';

// Initialize database connection
$database = new Database();
$db = $database->getConnection();

$book = new Book($db);
$category = new Category($db);

// Get HTTP method
$method = $_SERVER['REQUEST_METHOD'];

// Get request URI and extract endpoint
$request_uri = $_SERVER['REQUEST_URI'];
$path = parse_url($request_uri, PHP_URL_PATH);
$path_segments = explode('/', trim($path, '/'));

// Extract endpoint and parameters
$endpoint = $path_segments[count($path_segments) - 1];
$bookId = isset($path_segments[count($path_segments) - 1]) && is_numeric($path_segments[count($path_segments) - 1]) 
    ? $path_segments[count($path_segments) - 1] : null;

switch($method) {
    case 'GET':
        if($endpoint === 'books' || $endpoint === '') {
            getAllBooks();
        } elseif($endpoint === 'featured') {
            getFeaturedBooks();
        } elseif(is_numeric($endpoint)) {
            getBook($endpoint);
        } elseif($endpoint === 'categories') {
            getCategories();
        } else {
            // Try to get book by slug
            getBookBySlug($endpoint);
        }
        break;
        
    case 'POST':
        if($endpoint === 'books') {
            createBook();
        } else {
            http_response_code(404);
            echo json_encode(['message' => 'Endpoint not found']);
        }
        break;
        
    case 'PUT':
        if(is_numeric($endpoint)) {
            updateBook($endpoint);
        } else {
            http_response_code(404);
            echo json_encode(['message' => 'Endpoint not found']);
        }
        break;
        
    case 'DELETE':
        if(is_numeric($endpoint)) {
            deleteBook($endpoint);
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
 * Get all books with filtering and pagination
 */
function getAllBooks() {
    global $book;
    
    // Get query parameters
    $page = isset($_GET['page']) ? (int)$_GET['page'] : 1;
    $limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 12;
    $condition = isset($_GET['condition']) ? $_GET['condition'] : null;
    $category = isset($_GET['category']) ? $_GET['category'] : null;
    $search = isset($_GET['search']) ? $_GET['search'] : null;

    $stmt = $book->read($page, $limit, $condition, $category, $search);
    $num = $stmt->rowCount();

    if($num > 0) {
        $books_arr = array();
        
        while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            extract($row);
            
            $book_item = array(
                'id' => $id,
                'title' => $title,
                'slug' => $slug,
                'author' => $author,
                'isbn' => $isbn,
                'description' => $description,
                'price' => floatval($price),
                'sale_price' => $sale_price ? floatval($sale_price) : null,
                'current_price' => $sale_price ? floatval($sale_price) : floatval($price),
                'stock_quantity' => intval($stock_quantity),
                'condition' => $condition,
                'language' => $language,
                'pages' => $pages ? intval($pages) : null,
                'publisher' => $publisher,
                'publication_date' => $publication_date,
                'image' => $image,
                'images' => $images ? json_decode($images) : null,
                'is_featured' => boolval($is_featured),
                'views' => intval($views),
                'average_rating' => $average_rating ? floatval($average_rating) : null,
                'review_count' => intval($review_count),
                'category' => array(
                    'id' => $category_id,
                    'name' => $category_name,
                    'slug' => $category_slug
                ),
                'created_at' => $created_at
            );
            
            array_push($books_arr, $book_item);
        }

        // Get total count for pagination
        $total = $book->getTotalCount($condition, $category, $search);
        $totalPages = ceil($total / $limit);

        echo json_encode(array(
            'books' => $books_arr,
            'pagination' => array(
                'current_page' => $page,
                'total_pages' => $totalPages,
                'total_items' => $total,
                'items_per_page' => $limit,
                'has_next' => $page < $totalPages,
                'has_prev' => $page > 1
            )
        ));
    } else {
        echo json_encode(array('books' => array(), 'pagination' => array()));
    }
}

/**
 * Get featured books
 */
function getFeaturedBooks() {
    global $book;
    
    $limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 6;
    $stmt = $book->getFeatured($limit);
    $num = $stmt->rowCount();

    if($num > 0) {
        $books_arr = array();
        
        while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            extract($row);
            
            $book_item = array(
                'id' => $id,
                'title' => $title,
                'slug' => $slug,
                'author' => $author,
                'price' => floatval($price),
                'sale_price' => $sale_price ? floatval($sale_price) : null,
                'current_price' => $sale_price ? floatval($sale_price) : floatval($price),
                'condition' => $condition,
                'image' => $image,
                'average_rating' => $average_rating ? floatval($average_rating) : null,
                'review_count' => intval($review_count),
                'category' => array(
                    'name' => $category_name,
                    'slug' => $category_slug
                )
            );
            
            array_push($books_arr, $book_item);
        }

        echo json_encode(array('books' => $books_arr));
    } else {
        echo json_encode(array('books' => array()));
    }
}

/**
 * Get single book by ID
 */
function getBook($id) {
    global $book;
    
    $book->id = $id;
    
    if($book->readOne()) {
        $book_item = array(
            'id' => $book->id,
            'title' => $book->title,
            'slug' => $book->slug,
            'author' => $book->author,
            'isbn' => $book->isbn,
            'description' => $book->description,
            'price' => floatval($book->price),
            'sale_price' => $book->sale_price ? floatval($book->sale_price) : null,
            'current_price' => $book->sale_price ? floatval($book->sale_price) : floatval($book->price),
            'stock_quantity' => intval($book->stock_quantity),
            'condition' => $book->condition,
            'language' => $book->language,
            'pages' => $book->pages ? intval($book->pages) : null,
            'publisher' => $book->publisher,
            'publication_date' => $book->publication_date,
            'image' => $book->image,
            'images' => $book->images ? json_decode($book->images) : null,
            'weight' => $book->weight ? floatval($book->weight) : null,
            'dimensions' => $book->dimensions,
            'is_featured' => boolval($book->is_featured),
            'views' => intval($book->views),
            'average_rating' => $book->average_rating ? floatval($book->average_rating) : null,
            'review_count' => intval($book->review_count),
            'category' => array(
                'id' => $book->category_id,
                'name' => $book->category_name,
                'slug' => $book->category_slug
            ),
            'created_at' => $book->created_at
        );

        echo json_encode($book_item);
    } else {
        http_response_code(404);
        echo json_encode(['message' => 'Book not found']);
    }
}

/**
 * Get single book by slug
 */
function getBookBySlug($slug) {
    global $book;
    
    $book->slug = $slug;
    
    if($book->readOne()) {
        $book_item = array(
            'id' => $book->id,
            'title' => $book->title,
            'slug' => $book->slug,
            'author' => $book->author,
            'isbn' => $book->isbn,
            'description' => $book->description,
            'price' => floatval($book->price),
            'sale_price' => $book->sale_price ? floatval($book->sale_price) : null,
            'current_price' => $book->sale_price ? floatval($book->sale_price) : floatval($book->price),
            'stock_quantity' => intval($book->stock_quantity),
            'condition' => $book->condition,
            'language' => $book->language,
            'pages' => $book->pages ? intval($book->pages) : null,
            'publisher' => $book->publisher,
            'publication_date' => $book->publication_date,
            'image' => $book->image,
            'images' => $book->images ? json_decode($book->images) : null,
            'weight' => $book->weight ? floatval($book->weight) : null,
            'dimensions' => $book->dimensions,
            'is_featured' => boolval($book->is_featured),
            'views' => intval($book->views),
            'average_rating' => $book->average_rating ? floatval($book->average_rating) : null,
            'review_count' => intval($book->review_count),
            'category' => array(
                'id' => $book->category_id,
                'name' => $book->category_name,
                'slug' => $book->category_slug
            ),
            'created_at' => $book->created_at
        );

        echo json_encode($book_item);
    } else {
        http_response_code(404);
        echo json_encode(['message' => 'Book not found']);
    }
}

/**
 * Get all categories
 */
function getCategories() {
    global $category;
    
    $stmt = $category->read();
    $num = $stmt->rowCount();

    if($num > 0) {
        $categories_arr = array();
        
        while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            extract($row);
            
            $category_item = array(
                'id' => $id,
                'name' => $name,
                'slug' => $slug,
                'description' => $description,
                'image' => $image,
                'book_count' => intval($book_count),
                'sort_order' => intval($sort_order)
            );
            
            array_push($categories_arr, $category_item);
        }

        echo json_encode(array('categories' => $categories_arr));
    } else {
        echo json_encode(array('categories' => array()));
    }
}

/**
 * Create new book (Admin only)
 */
function createBook() {
    global $book;
    
    AuthMiddleware::requireAdmin();
    
    $data = json_decode(file_get_contents("php://input"));

    if(empty($data->title) || empty($data->author) || empty($data->price) || empty($data->category_id)) {
        http_response_code(400);
        echo json_encode(['message' => 'Required fields: title, author, price, category_id']);
        return;
    }

    // Set book properties
    $book->title = $data->title;
    $book->slug = $data->slug ?? null;
    $book->author = $data->author;
    $book->isbn = $data->isbn ?? null;
    $book->description = $data->description ?? null;
    $book->price = $data->price;
    $book->sale_price = $data->sale_price ?? null;
    $book->stock_quantity = $data->stock_quantity ?? 0;
    $book->category_id = $data->category_id;
    $book->condition = $data->condition ?? 'new';
    $book->language = $data->language ?? 'English';
    $book->pages = $data->pages ?? null;
    $book->publisher = $data->publisher ?? null;
    $book->publication_date = $data->publication_date ?? null;
    $book->image = $data->image ?? null;
    $book->images = $data->images ? json_encode($data->images) : null;
    $book->weight = $data->weight ?? null;
    $book->dimensions = $data->dimensions ?? null;
    $book->is_featured = $data->is_featured ?? 0;

    if($book->create()) {
        http_response_code(201);
        echo json_encode(['message' => 'Book created successfully']);
    } else {
        http_response_code(500);
        echo json_encode(['message' => 'Failed to create book']);
    }
}

/**
 * Update book (Admin only)
 */
function updateBook($id) {
    global $book;
    
    AuthMiddleware::requireAdmin();
    
    $data = json_decode(file_get_contents("php://input"));

    $book->id = $id;
    
    if(!$book->readOne()) {
        http_response_code(404);
        echo json_encode(['message' => 'Book not found']);
        return;
    }

    // Update book properties
    $book->title = $data->title ?? $book->title;
    $book->slug = $data->slug ?? $book->slug;
    $book->author = $data->author ?? $book->author;
    $book->isbn = $data->isbn ?? $book->isbn;
    $book->description = $data->description ?? $book->description;
    $book->price = $data->price ?? $book->price;
    $book->sale_price = $data->sale_price ?? $book->sale_price;
    $book->stock_quantity = $data->stock_quantity ?? $book->stock_quantity;
    $book->category_id = $data->category_id ?? $book->category_id;
    $book->condition = $data->condition ?? $book->condition;
    $book->language = $data->language ?? $book->language;
    $book->pages = $data->pages ?? $book->pages;
    $book->publisher = $data->publisher ?? $book->publisher;
    $book->publication_date = $data->publication_date ?? $book->publication_date;
    $book->image = $data->image ?? $book->image;
    $book->images = isset($data->images) ? json_encode($data->images) : $book->images;
    $book->weight = $data->weight ?? $book->weight;
    $book->dimensions = $data->dimensions ?? $book->dimensions;
    $book->is_featured = isset($data->is_featured) ? $data->is_featured : $book->is_featured;

    if($book->update()) {
        echo json_encode(['message' => 'Book updated successfully']);
    } else {
        http_response_code(500);
        echo json_encode(['message' => 'Failed to update book']);
    }
}

/**
 * Delete book (Admin only)
 */
function deleteBook($id) {
    global $book;
    
    AuthMiddleware::requireAdmin();
    
    $book->id = $id;
    
    if($book->delete()) {
        echo json_encode(['message' => 'Book deleted successfully']);
    } else {
        http_response_code(500);
        echo json_encode(['message' => 'Failed to delete book']);
    }
}
?>
