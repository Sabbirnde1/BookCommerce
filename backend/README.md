# BookCommerce PHP Backend

A RESTful PHP backend API for the BookCommerce e-commerce platform with MySQL database.

## 🚀 Features

- **RESTful API** with proper HTTP methods and status codes
- **JWT Authentication** for secure user sessions
- **Role-based Access Control** (Admin/Customer)
- **MySQL Database** with optimized schema
- **Input Validation** and sanitization
- **CORS Support** for frontend integration
- **Error Handling** with meaningful messages
- **Database Migrations** for easy setup

## 🛠️ Tech Stack

- **PHP 7.4+** - Server-side scripting
- **MySQL 8.0+** - Database
- **JWT** - Authentication tokens
- **Apache/Nginx** - Web server
- **PDO** - Database abstraction layer

## 📋 Prerequisites

- PHP 7.4 or higher
- MySQL 8.0 or higher
- Apache or Nginx web server
- Composer (optional, for future dependencies)

## ⚙️ Installation

### 1. Clone the Repository
```bash
git clone https://github.com/Sabbirnde/BookCommerce.git
cd BookCommerce
```

### 2. Configure Database
Edit `backend/config/database.php` with your database credentials:
```php
private $host = 'localhost';
private $db_name = 'bookcommerce';
private $username = 'your_username';
private $password = 'your_password';
```

### 3. Set up Virtual Host (Apache)
Create a virtual host pointing to the project directory:
```apache
<VirtualHost *:80>
    DocumentRoot "C:/path/to/BookCommerce"
    ServerName bookcommerce.local
    
    <Directory "C:/path/to/BookCommerce">
        AllowOverride All
        Require all granted
    </Directory>
</VirtualHost>
```

### 4. Initialize Database
Run the setup script to create the database and insert sample data:
```bash
cd backend
php setup.php
```

### 5. Update API Configuration
Edit `backend/config/config.php`:
```php
// Update CORS origin to match your frontend URL
header("Access-Control-Allow-Origin: http://localhost:8080");

// Update API base URL
define('API_BASE_URL', 'http://bookcommerce.local/backend/api');

// Change JWT secret key in production
define('JWT_SECRET_KEY', 'your-super-secret-key-here');
```

## 📁 Directory Structure

```
backend/
├── api/                    # API endpoints
│   ├── auth.php           # Authentication endpoints
│   ├── books.php          # Book management
│   ├── cart.php           # Shopping cart
│   └── index.php          # API router
├── config/                # Configuration files
│   ├── config.php         # General config
│   └── database.php       # Database config
├── controllers/           # Business logic (future)
├── middleware/            # Middleware classes
│   └── AuthMiddleware.php # JWT authentication
├── models/                # Data models
│   ├── User.php          # User model
│   ├── Book.php          # Book model
│   ├── Category.php      # Category model
│   └── Cart.php          # Cart model
├── utils/                 # Utility classes
│   └── JWTUtil.php       # JWT handling
├── .htaccess             # URL rewriting rules
└── setup.php             # Database setup script

database/
└── migrations/           # Database migrations
    ├── 001_create_bookcommerce_schema.sql
    └── 002_insert_sample_data.sql
```

## 🔗 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile (requires auth)
- `PUT /api/auth/profile` - Update user profile (requires auth)
- `GET /api/auth/verify` - Verify JWT token

### Books
- `GET /api/books` - Get all books (with pagination and filters)
- `GET /api/books/featured` - Get featured books
- `GET /api/books/{id}` - Get single book by ID
- `GET /api/books/{slug}` - Get single book by slug
- `POST /api/books` - Create new book (admin only)
- `PUT /api/books/{id}` - Update book (admin only)
- `DELETE /api/books/{id}` - Delete book (admin only)

### Categories
- `GET /api/categories` - Get all categories

### Shopping Cart
- `GET /api/cart` - Get user's cart items (requires auth)
- `GET /api/cart/total` - Get cart summary (requires auth)
- `POST /api/cart/add` - Add item to cart (requires auth)
- `PUT /api/cart/update` - Update cart item quantity (requires auth)
- `DELETE /api/cart/remove` - Remove item from cart (requires auth)
- `DELETE /api/cart/clear` - Clear entire cart (requires auth)

## 🔐 Authentication

The API uses JWT (JSON Web Tokens) for authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

### Default Users
After running the setup script, you'll have these default accounts:

**Admin:**
- Email: admin@bookcommerce.com
- Password: password

**Customer:**
- Email: john@example.com
- Password: password

## 📝 API Usage Examples

### Register a new user
```bash
curl -X POST http://bookcommerce.local/backend/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "newuser",
    "email": "newuser@example.com",
    "password": "securepassword",
    "first_name": "John",
    "last_name": "Doe"
  }'
```

### Login
```bash
curl -X POST http://bookcommerce.local/backend/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@bookcommerce.com",
    "password": "password"
  }'
```

### Get books with filters
```bash
curl "http://bookcommerce.local/backend/api/books?condition=new&category=fiction&page=1&limit=12"
```

### Add item to cart
```bash
curl -X POST http://bookcommerce.local/backend/api/cart/add \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <your-jwt-token>" \
  -d '{
    "book_id": 1,
    "quantity": 2
  }'
```

## 🗄️ Database Schema

The database includes the following main tables:
- `users` - User accounts and profiles
- `categories` - Book categories
- `books` - Book inventory
- `cart` - Shopping cart items
- `wishlist` - User wishlists
- `orders` - Order history
- `order_items` - Order line items
- `book_reviews` - Book reviews and ratings
- `email_subscribers` - Newsletter subscribers
- `email_campaigns` - Email marketing campaigns

## 🔧 Configuration

### Environment Variables
For production, consider using environment variables:

```php
// In config/database.php
private $host = $_ENV['DB_HOST'] ?? 'localhost';
private $db_name = $_ENV['DB_NAME'] ?? 'bookcommerce';
private $username = $_ENV['DB_USER'] ?? 'root';
private $password = $_ENV['DB_PASS'] ?? '';
```

### Security
- Change the JWT secret key in production
- Use HTTPS in production
- Implement rate limiting
- Add input validation for file uploads
- Use parameterized queries (already implemented)

## 🚀 Deployment

### Production Checklist
1. Update database credentials
2. Change JWT secret key
3. Enable HTTPS
4. Configure proper CORS origins
5. Set up error logging
6. Enable PHP OPcache
7. Configure database connection pooling
8. Set up automated backups

## 🤝 API Response Format

All API responses follow a consistent JSON format:

**Success Response:**
```json
{
  "data": {...},
  "message": "Success message"
}
```

**Error Response:**
```json
{
  "message": "Error description",
  "error_code": "ERROR_CODE"
}
```

## 📚 Development

### Adding New Endpoints
1. Create a new PHP file in the `api/` directory
2. Follow the existing pattern for request routing
3. Add proper authentication checks
4. Implement input validation
5. Return consistent JSON responses
6. Update the API router in `api/index.php`

### Database Migrations
To add new database changes:
1. Create a new SQL file in `database/migrations/`
2. Use incremental numbering (003, 004, etc.)
3. Include both structure and data changes
4. Test thoroughly before deployment

## 🐛 Troubleshooting

### Common Issues
1. **CORS Errors**: Update the origin in `config/config.php`
2. **Database Connection**: Check credentials in `config/database.php`
3. **JWT Errors**: Verify the secret key and token format
4. **404 Errors**: Check `.htaccess` file and URL rewriting
5. **Permission Denied**: Check file permissions and web server config

## 📄 License

This project is licensed under the MIT License.
