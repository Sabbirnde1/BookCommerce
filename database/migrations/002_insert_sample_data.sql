-- Sample Data for BookCommerce
-- Insert sample categories, books, and users for development

USE `bookcommerce`;

-- Insert Categories
INSERT INTO `categories` (`name`, `slug`, `description`, `sort_order`) VALUES
('Fiction', 'fiction', 'Fiction books including novels, short stories, and literary works', 1),
('Non-Fiction', 'non-fiction', 'Non-fiction books including biographies, self-help, and educational content', 2),
('Science & Technology', 'science-technology', 'Books about science, technology, programming, and engineering', 3),
('Business & Economics', 'business-economics', 'Business, economics, finance, and entrepreneurship books', 4),
('Health & Fitness', 'health-fitness', 'Health, fitness, nutrition, and wellness books', 5),
('Children & Young Adult', 'children-young-adult', 'Books for children and young adult readers', 6),
('History', 'history', 'Historical books and biographies', 7),
('Art & Design', 'art-design', 'Books about art, design, photography, and creativity', 8);

-- Insert Sample Users
INSERT INTO `users` (`username`, `email`, `password`, `first_name`, `last_name`, `role`) VALUES
('admin', 'admin@bookcommerce.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Admin', 'User', 'admin'),
('johndoe', 'john@example.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'John', 'Doe', 'customer'),
('janesmitha', 'jane@example.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Jane', 'Smith', 'customer');

-- Insert Sample Books
INSERT INTO `books` (`title`, `slug`, `author`, `isbn`, `description`, `price`, `stock_quantity`, `category_id`, `condition`, `is_featured`) VALUES
('The Great Gatsby', 'the-great-gatsby', 'F. Scott Fitzgerald', '9780743273565', 'A classic American novel about the Jazz Age', 12.99, 50, 1, 'new', 1),
('To Kill a Mockingbird', 'to-kill-a-mockingbird', 'Harper Lee', '9780061120084', 'A gripping tale of racial injustice and childhood innocence', 13.99, 30, 1, 'new', 1),
('1984', '1984', 'George Orwell', '9780451524935', 'A dystopian social science fiction novel', 14.99, 40, 1, 'new', 1),
('Clean Code', 'clean-code', 'Robert C. Martin', '9780132350884', 'A handbook of agile software craftsmanship', 45.99, 25, 3, 'new', 1),
('The Lean Startup', 'the-lean-startup', 'Eric Ries', '9780307887894', 'How todays entrepreneurs use continuous innovation', 16.99, 35, 4, 'new', 0),
('Sapiens', 'sapiens', 'Yuval Noah Harari', '9780062316097', 'A brief history of humankind', 18.99, 20, 7, 'new', 1),
('Atomic Habits', 'atomic-habits', 'James Clear', '9780735211292', 'An easy and proven way to build good habits', 19.99, 45, 2, 'new', 1),
('The Art of War', 'the-art-of-war', 'Sun Tzu', '9781599869773', 'Ancient Chinese military treatise', 9.99, 60, 7, 'old', 0),
('Harry Potter and the Philosopher\'s Stone', 'harry-potter-philosophers-stone', 'J.K. Rowling', '9780747532699', 'The first book in the Harry Potter series', 11.99, 100, 6, 'new', 1),
('The Design of Everyday Things', 'design-everyday-things', 'Don Norman', '9780465050659', 'Design principles for everyday objects', 22.99, 15, 8, 'new', 0);

-- Insert Sample Email Subscribers
INSERT INTO `email_subscribers` (`email`, `name`) VALUES
('subscriber1@example.com', 'Book Lover 1'),
('subscriber2@example.com', 'Book Lover 2'),
('subscriber3@example.com', 'Book Lover 3');

-- Insert Sample Reviews
INSERT INTO `book_reviews` (`book_id`, `user_id`, `rating`, `title`, `review`, `is_approved`) VALUES
(1, 2, 5, 'Excellent Classic', 'A timeless masterpiece that captures the essence of the American Dream.', 1),
(1, 3, 4, 'Good Read', 'Well written and engaging, though the ending was a bit predictable.', 1),
(4, 2, 5, 'Must-read for Developers', 'Every programmer should read this book. It changed how I write code.', 1),
(7, 3, 5, 'Life-changing', 'This book helped me develop better habits and improve my daily routine.', 1);
