<?php
/**
 * Cart Model
 * 
 * Handles shopping cart operations
 */

class Cart {
    private $conn;
    private $table = 'cart';

    public $id;
    public $user_id;
    public $book_id;
    public $quantity;
    public $created_at;

    public function __construct($db) {
        $this->conn = $db;
    }

    /**
     * Get user's cart items
     */
    public function getCartItems() {
        $query = "SELECT c.*, b.title, b.author, b.price, b.sale_price, 
                         b.image, b.stock_quantity, b.is_active,
                         COALESCE(b.sale_price, b.price) as current_price,
                         (c.quantity * COALESCE(b.sale_price, b.price)) as item_total
                  FROM " . $this->table . " c
                  JOIN books b ON c.book_id = b.id
                  WHERE c.user_id = :user_id AND b.is_active = 1
                  ORDER BY c.created_at DESC";

        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":user_id", $this->user_id);
        $stmt->execute();

        return $stmt;
    }

    /**
     * Add item to cart
     */
    public function addItem() {
        // Check if item already exists in cart
        $checkQuery = "SELECT id, quantity FROM " . $this->table . " 
                       WHERE user_id = :user_id AND book_id = :book_id";
        
        $checkStmt = $this->conn->prepare($checkQuery);
        $checkStmt->bindParam(":user_id", $this->user_id);
        $checkStmt->bindParam(":book_id", $this->book_id);
        $checkStmt->execute();

        if($checkStmt->rowCount() > 0) {
            // Update existing item
            $row = $checkStmt->fetch(PDO::FETCH_ASSOC);
            $this->id = $row['id'];
            $this->quantity += $row['quantity'];
            return $this->updateQuantity();
        } else {
            // Add new item
            $query = "INSERT INTO " . $this->table . "
                      SET user_id=:user_id, book_id=:book_id, quantity=:quantity";

            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(":user_id", $this->user_id);
            $stmt->bindParam(":book_id", $this->book_id);
            $stmt->bindParam(":quantity", $this->quantity);

            return $stmt->execute();
        }
    }

    /**
     * Update item quantity
     */
    public function updateQuantity() {
        $query = "UPDATE " . $this->table . " 
                  SET quantity = :quantity 
                  WHERE id = :id AND user_id = :user_id";

        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":quantity", $this->quantity);
        $stmt->bindParam(":id", $this->id);
        $stmt->bindParam(":user_id", $this->user_id);

        return $stmt->execute();
    }

    /**
     * Remove item from cart
     */
    public function removeItem() {
        $query = "DELETE FROM " . $this->table . " 
                  WHERE id = :id AND user_id = :user_id";

        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":id", $this->id);
        $stmt->bindParam(":user_id", $this->user_id);

        return $stmt->execute();
    }

    /**
     * Clear user's cart
     */
    public function clearCart() {
        $query = "DELETE FROM " . $this->table . " WHERE user_id = :user_id";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":user_id", $this->user_id);
        return $stmt->execute();
    }

    /**
     * Get cart total
     */
    public function getCartTotal() {
        $query = "SELECT 
                    COUNT(*) as item_count,
                    SUM(c.quantity) as total_quantity,
                    SUM(c.quantity * COALESCE(b.sale_price, b.price)) as total_amount
                  FROM " . $this->table . " c
                  JOIN books b ON c.book_id = b.id
                  WHERE c.user_id = :user_id AND b.is_active = 1";

        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":user_id", $this->user_id);
        $stmt->execute();

        return $stmt->fetch(PDO::FETCH_ASSOC);
    }
}
?>
