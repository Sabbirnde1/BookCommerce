<?php
/**
 * Category Model
 * 
 * Handles category-related database operations
 */

class Category {
    private $conn;
    private $table = 'categories';

    public $id;
    public $name;
    public $slug;
    public $description;
    public $image;
    public $parent_id;
    public $sort_order;
    public $is_active;
    public $created_at;

    public function __construct($db) {
        $this->conn = $db;
    }

    /**
     * Get all active categories
     */
    public function read() {
        $query = "SELECT c.*, COUNT(b.id) as book_count
                  FROM " . $this->table . " c
                  LEFT JOIN books b ON c.id = b.category_id AND b.is_active = 1
                  WHERE c.is_active = 1
                  GROUP BY c.id
                  ORDER BY c.sort_order ASC, c.name ASC";

        $stmt = $this->conn->prepare($query);
        $stmt->execute();

        return $stmt;
    }

    /**
     * Get single category by ID or slug
     */
    public function readOne() {
        $query = "SELECT * FROM " . $this->table . " 
                  WHERE is_active = 1 AND (id = :id OR slug = :slug)";

        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":id", $this->id);
        $stmt->bindParam(":slug", $this->slug);
        $stmt->execute();

        $row = $stmt->fetch(PDO::FETCH_ASSOC);

        if($row) {
            $this->id = $row['id'];
            $this->name = $row['name'];
            $this->slug = $row['slug'];
            $this->description = $row['description'];
            $this->image = $row['image'];
            $this->parent_id = $row['parent_id'];
            $this->sort_order = $row['sort_order'];
            $this->is_active = $row['is_active'];
            $this->created_at = $row['created_at'];
            return true;
        }
        return false;
    }

    /**
     * Create new category
     */
    public function create() {
        $query = "INSERT INTO " . $this->table . "
                  SET name=:name, slug=:slug, description=:description,
                      image=:image, parent_id=:parent_id, sort_order=:sort_order";

        $stmt = $this->conn->prepare($query);

        // Sanitize
        $this->name = htmlspecialchars(strip_tags($this->name));
        $this->slug = $this->slug ?: $this->createSlug($this->name);
        $this->description = htmlspecialchars(strip_tags($this->description));
        $this->sort_order = $this->sort_order ?: 0;

        // Bind values
        $stmt->bindParam(":name", $this->name);
        $stmt->bindParam(":slug", $this->slug);
        $stmt->bindParam(":description", $this->description);
        $stmt->bindParam(":image", $this->image);
        $stmt->bindParam(":parent_id", $this->parent_id);
        $stmt->bindParam(":sort_order", $this->sort_order);

        return $stmt->execute();
    }

    /**
     * Update category
     */
    public function update() {
        $query = "UPDATE " . $this->table . "
                  SET name=:name, slug=:slug, description=:description,
                      image=:image, parent_id=:parent_id, sort_order=:sort_order
                  WHERE id=:id";

        $stmt = $this->conn->prepare($query);

        // Sanitize
        $this->name = htmlspecialchars(strip_tags($this->name));
        $this->description = htmlspecialchars(strip_tags($this->description));

        // Bind values
        $stmt->bindParam(":name", $this->name);
        $stmt->bindParam(":slug", $this->slug);
        $stmt->bindParam(":description", $this->description);
        $stmt->bindParam(":image", $this->image);
        $stmt->bindParam(":parent_id", $this->parent_id);
        $stmt->bindParam(":sort_order", $this->sort_order);
        $stmt->bindParam(":id", $this->id);

        return $stmt->execute();
    }

    /**
     * Delete category (soft delete)
     */
    public function delete() {
        $query = "UPDATE " . $this->table . " SET is_active = 0 WHERE id = :id";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":id", $this->id);
        return $stmt->execute();
    }

    /**
     * Create URL-friendly slug
     */
    private function createSlug($string) {
        return strtolower(trim(preg_replace('/[^A-Za-z0-9-]+/', '-', $string)));
    }
}
?>
