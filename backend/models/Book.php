<?php
/**
 * Book Model
 * 
 * Handles book-related database operations
 */

class Book {
    private $conn;
    private $table = 'books';

    public $id;
    public $title;
    public $slug;
    public $author;
    public $isbn;
    public $description;
    public $price;
    public $sale_price;
    public $stock_quantity;
    public $category_id;
    public $condition;
    public $language;
    public $pages;
    public $publisher;
    public $publication_date;
    public $image;
    public $images;
    public $weight;
    public $dimensions;
    public $is_featured;
    public $is_active;
    public $views;
    public $created_at;
    
    // Additional properties for joined data
    public $category_name;
    public $category_slug;
    public $average_rating;
    public $review_count;

    public function __construct($db) {
        $this->conn = $db;
    }

    /**
     * Get all books with pagination and filters
     */
    public function read($page = 1, $limit = 12, $condition = null, $category = null, $search = null) {
        $offset = ($page - 1) * $limit;
        
        $query = "SELECT b.*, c.name as category_name, c.slug as category_slug,
                         AVG(br.rating) as average_rating,
                         COUNT(br.id) as review_count
                  FROM " . $this->table . " b
                  LEFT JOIN categories c ON b.category_id = c.id
                  LEFT JOIN book_reviews br ON b.id = br.book_id AND br.is_approved = 1
                  WHERE b.is_active = 1";

        if($condition) {
            $query .= " AND b.condition = :condition";
        }

        if($category) {
            $query .= " AND c.slug = :category";
        }

        if($search) {
            $query .= " AND (b.title LIKE :search OR b.author LIKE :search OR b.description LIKE :search)";
        }

        $query .= " GROUP BY b.id ORDER BY b.created_at DESC LIMIT :limit OFFSET :offset";

        $stmt = $this->conn->prepare($query);

        if($condition) {
            $stmt->bindParam(":condition", $condition);
        }

        if($category) {
            $stmt->bindParam(":category", $category);
        }

        if($search) {
            $searchTerm = "%{$search}%";
            $stmt->bindParam(":search", $searchTerm);
        }

        $stmt->bindParam(":limit", $limit, PDO::PARAM_INT);
        $stmt->bindParam(":offset", $offset, PDO::PARAM_INT);
        $stmt->execute();

        return $stmt;
    }

    /**
     * Get featured books
     */
    public function getFeatured($limit = 6) {
        $query = "SELECT b.*, c.name as category_name, c.slug as category_slug,
                         AVG(br.rating) as average_rating,
                         COUNT(br.id) as review_count
                  FROM " . $this->table . " b
                  LEFT JOIN categories c ON b.category_id = c.id
                  LEFT JOIN book_reviews br ON b.id = br.book_id AND br.is_approved = 1
                  WHERE b.is_active = 1 AND b.is_featured = 1
                  GROUP BY b.id
                  ORDER BY b.created_at DESC
                  LIMIT :limit";

        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":limit", $limit, PDO::PARAM_INT);
        $stmt->execute();

        return $stmt;
    }

    /**
     * Get single book by ID or slug
     */
    public function readOne() {
        $query = "SELECT b.*, c.name as category_name, c.slug as category_slug,
                         AVG(br.rating) as average_rating,
                         COUNT(br.id) as review_count
                  FROM " . $this->table . " b
                  LEFT JOIN categories c ON b.category_id = c.id
                  LEFT JOIN book_reviews br ON b.id = br.book_id AND br.is_approved = 1
                  WHERE b.is_active = 1 AND (b.id = :id OR b.slug = :slug)
                  GROUP BY b.id";

        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":id", $this->id);
        $stmt->bindParam(":slug", $this->slug);
        $stmt->execute();

        $row = $stmt->fetch(PDO::FETCH_ASSOC);

        if($row) {
            $this->id = $row['id'];
            $this->title = $row['title'];
            $this->slug = $row['slug'];
            $this->author = $row['author'];
            $this->isbn = $row['isbn'];
            $this->description = $row['description'];
            $this->price = $row['price'];
            $this->sale_price = $row['sale_price'];
            $this->stock_quantity = $row['stock_quantity'];
            $this->category_id = $row['category_id'];
            $this->condition = $row['condition'];
            $this->language = $row['language'];
            $this->pages = $row['pages'];
            $this->publisher = $row['publisher'];
            $this->publication_date = $row['publication_date'];
            $this->image = $row['image'];
            $this->images = $row['images'];
            $this->weight = $row['weight'];
            $this->dimensions = $row['dimensions'];
            $this->is_featured = $row['is_featured'];
            $this->views = $row['views'];
            $this->created_at = $row['created_at'];

            // Additional fields
            $this->category_name = $row['category_name'];
            $this->category_slug = $row['category_slug'];
            $this->average_rating = $row['average_rating'];
            $this->review_count = $row['review_count'];

            // Update view count
            $this->updateViews();

            return true;
        }
        return false;
    }

    /**
     * Create new book
     */
    public function create() {
        $query = "INSERT INTO " . $this->table . "
                  SET title=:title, slug=:slug, author=:author, isbn=:isbn,
                      description=:description, price=:price, sale_price=:sale_price,
                      stock_quantity=:stock_quantity, category_id=:category_id,
                      `condition`=:condition, language=:language, pages=:pages,
                      publisher=:publisher, publication_date=:publication_date,
                      image=:image, images=:images, weight=:weight,
                      dimensions=:dimensions, is_featured=:is_featured";

        $stmt = $this->conn->prepare($query);

        // Sanitize
        $this->title = htmlspecialchars(strip_tags($this->title));
        $this->slug = $this->slug ?: $this->createSlug($this->title);
        $this->author = htmlspecialchars(strip_tags($this->author));
        $this->description = htmlspecialchars(strip_tags($this->description));
        $this->is_featured = $this->is_featured ?: 0;

        // Bind values
        $stmt->bindParam(":title", $this->title);
        $stmt->bindParam(":slug", $this->slug);
        $stmt->bindParam(":author", $this->author);
        $stmt->bindParam(":isbn", $this->isbn);
        $stmt->bindParam(":description", $this->description);
        $stmt->bindParam(":price", $this->price);
        $stmt->bindParam(":sale_price", $this->sale_price);
        $stmt->bindParam(":stock_quantity", $this->stock_quantity);
        $stmt->bindParam(":category_id", $this->category_id);
        $stmt->bindParam(":condition", $this->condition);
        $stmt->bindParam(":language", $this->language);
        $stmt->bindParam(":pages", $this->pages);
        $stmt->bindParam(":publisher", $this->publisher);
        $stmt->bindParam(":publication_date", $this->publication_date);
        $stmt->bindParam(":image", $this->image);
        $stmt->bindParam(":images", $this->images);
        $stmt->bindParam(":weight", $this->weight);
        $stmt->bindParam(":dimensions", $this->dimensions);
        $stmt->bindParam(":is_featured", $this->is_featured);

        return $stmt->execute();
    }

    /**
     * Update book
     */
    public function update() {
        $query = "UPDATE " . $this->table . "
                  SET title=:title, slug=:slug, author=:author, isbn=:isbn,
                      description=:description, price=:price, sale_price=:sale_price,
                      stock_quantity=:stock_quantity, category_id=:category_id,
                      `condition`=:condition, language=:language, pages=:pages,
                      publisher=:publisher, publication_date=:publication_date,
                      image=:image, images=:images, weight=:weight,
                      dimensions=:dimensions, is_featured=:is_featured
                  WHERE id=:id";

        $stmt = $this->conn->prepare($query);

        // Sanitize
        $this->title = htmlspecialchars(strip_tags($this->title));
        $this->author = htmlspecialchars(strip_tags($this->author));
        $this->description = htmlspecialchars(strip_tags($this->description));

        // Bind values
        $stmt->bindParam(":title", $this->title);
        $stmt->bindParam(":slug", $this->slug);
        $stmt->bindParam(":author", $this->author);
        $stmt->bindParam(":isbn", $this->isbn);
        $stmt->bindParam(":description", $this->description);
        $stmt->bindParam(":price", $this->price);
        $stmt->bindParam(":sale_price", $this->sale_price);
        $stmt->bindParam(":stock_quantity", $this->stock_quantity);
        $stmt->bindParam(":category_id", $this->category_id);
        $stmt->bindParam(":condition", $this->condition);
        $stmt->bindParam(":language", $this->language);
        $stmt->bindParam(":pages", $this->pages);
        $stmt->bindParam(":publisher", $this->publisher);
        $stmt->bindParam(":publication_date", $this->publication_date);
        $stmt->bindParam(":image", $this->image);
        $stmt->bindParam(":images", $this->images);
        $stmt->bindParam(":weight", $this->weight);
        $stmt->bindParam(":dimensions", $this->dimensions);
        $stmt->bindParam(":is_featured", $this->is_featured);
        $stmt->bindParam(":id", $this->id);

        return $stmt->execute();
    }

    /**
     * Delete book
     */
    public function delete() {
        $query = "UPDATE " . $this->table . " SET is_active = 0 WHERE id = :id";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":id", $this->id);
        return $stmt->execute();
    }

    /**
     * Update view count
     */
    private function updateViews() {
        $query = "UPDATE " . $this->table . " SET views = views + 1 WHERE id = :id";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":id", $this->id);
        $stmt->execute();
    }

    /**
     * Create URL-friendly slug
     */
    private function createSlug($string) {
        return strtolower(trim(preg_replace('/[^A-Za-z0-9-]+/', '-', $string)));
    }

    /**
     * Get total count for pagination
     */
    public function getTotalCount($condition = null, $category = null, $search = null) {
        $query = "SELECT COUNT(*) as total FROM " . $this->table . " b
                  LEFT JOIN categories c ON b.category_id = c.id
                  WHERE b.is_active = 1";

        if($condition) {
            $query .= " AND b.condition = :condition";
        }

        if($category) {
            $query .= " AND c.slug = :category";
        }

        if($search) {
            $query .= " AND (b.title LIKE :search OR b.author LIKE :search OR b.description LIKE :search)";
        }

        $stmt = $this->conn->prepare($query);

        if($condition) {
            $stmt->bindParam(":condition", $condition);
        }

        if($category) {
            $stmt->bindParam(":category", $category);
        }

        if($search) {
            $searchTerm = "%{$search}%";
            $stmt->bindParam(":search", $searchTerm);
        }

        $stmt->execute();
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        return $row['total'];
    }
}
?>
