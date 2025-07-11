// Mock book database
export interface Book {
  id: string;
  title: string;
  author: string;
  price: number;
  originalPrice?: number;
  condition: "new" | "old";
  rating: number;
  image: string;
  description: string;
  genre: string;
  isbn: string;
  publisher: string;
  publishedYear: number;
  pages: number;
  isPopular?: boolean;
  inStock: number;
}

export const mockBooks: Book[] = [
  {
    id: "1",
    title: "The Great Gatsby",
    author: "F. Scott Fitzgerald",
    price: 12.99,
    originalPrice: 18.99,
    condition: "old",
    rating: 4,
    image: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=300&h=400&fit=crop",
    description: "A classic American novel about the Jazz Age and the American Dream.",
    genre: "Classic Literature",
    isbn: "978-0-7432-7356-5",
    publisher: "Scribner",
    publishedYear: 1925,
    pages: 180,
    isPopular: true,
    inStock: 5
  },
  {
    id: "2",
    title: "Atomic Habits",
    author: "James Clear",
    price: 16.99,
    condition: "new",
    rating: 5,
    image: "https://images.unsplash.com/photo-1589998059171-988d887df646?w=300&h=400&fit=crop",
    description: "An Easy & Proven Way to Build Good Habits & Break Bad Ones.",
    genre: "Self-Help",
    isbn: "978-0-7352-1129-2",
    publisher: "Avery",
    publishedYear: 2018,
    pages: 320,
    inStock: 12
  },
  {
    id: "3",
    title: "1984",
    author: "George Orwell",
    price: 9.99,
    originalPrice: 14.99,
    condition: "old",
    rating: 5,
    image: "https://images.unsplash.com/photo-1541963463532-d68292c34d19?w=300&h=400&fit=crop",
    description: "A dystopian novel about totalitarianism and surveillance.",
    genre: "Dystopian Fiction",
    isbn: "978-0-452-28423-4",
    publisher: "Plume",
    publishedYear: 1949,
    pages: 328,
    isPopular: true,
    inStock: 8
  },
  {
    id: "4",
    title: "The Psychology of Money",
    author: "Morgan Housel",
    price: 18.99,
    condition: "new",
    rating: 4,
    image: "https://images.unsplash.com/photo-1592496431122-2349e0fbc666?w=300&h=400&fit=crop",
    description: "Timeless lessons on wealth, greed, and happiness.",
    genre: "Finance",
    isbn: "978-0-857-19799-7",
    publisher: "Harriman House",
    publishedYear: 2020,
    pages: 256,
    inStock: 15
  },
  {
    id: "5",
    title: "To Kill a Mockingbird",
    author: "Harper Lee",
    price: 11.49,
    originalPrice: 16.99,
    condition: "old",
    rating: 5,
    image: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=300&h=400&fit=crop",
    description: "A gripping tale of racial injustice and childhood innocence.",
    genre: "Classic Literature",
    isbn: "978-0-06-112008-4",
    publisher: "Harper Perennial",
    publishedYear: 1960,
    pages: 376,
    isPopular: true,
    inStock: 6
  },
  {
    id: "6",
    title: "Sapiens",
    author: "Yuval Noah Harari",
    price: 19.99,
    condition: "new",
    rating: 4,
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=400&fit=crop",
    description: "A Brief History of Humankind.",
    genre: "History",
    isbn: "978-0-06-231609-7",
    publisher: "Harper",
    publishedYear: 2014,
    pages: 443,
    inStock: 20
  },
  {
    id: "7",
    title: "Pride and Prejudice",
    author: "Jane Austen",
    price: 8.99,
    originalPrice: 12.99,
    condition: "old",
    rating: 4,
    image: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=300&h=400&fit=crop",
    description: "A romantic novel about manners, upbringing, and marriage.",
    genre: "Romance",
    isbn: "978-0-14-143951-8",
    publisher: "Penguin Classics",
    publishedYear: 1813,
    pages: 432,
    inStock: 4
  },
  {
    id: "8",
    title: "The 7 Habits of Highly Effective People",
    author: "Stephen R. Covey",
    price: 15.99,
    condition: "new",
    rating: 4,
    image: "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=300&h=400&fit=crop",
    description: "Powerful lessons in personal change.",
    genre: "Self-Help",
    isbn: "978-1-982-13719-3",
    publisher: "Simon & Schuster",
    publishedYear: 1989,
    pages: 381,
    inStock: 18
  }
];

export const genres = [
  "All Genres",
  "Classic Literature",
  "Self-Help", 
  "Dystopian Fiction",
  "Finance",
  "History",
  "Romance",
  "Science Fiction",
  "Mystery",
  "Biography",
  "Philosophy",
  "Business"
];

// Search and filter functions
export const searchBooks = (books: Book[], query: string): Book[] => {
  if (!query.trim()) return books;
  
  const lowercaseQuery = query.toLowerCase();
  return books.filter(book => 
    book.title.toLowerCase().includes(lowercaseQuery) ||
    book.author.toLowerCase().includes(lowercaseQuery) ||
    book.genre.toLowerCase().includes(lowercaseQuery) ||
    book.description.toLowerCase().includes(lowercaseQuery)
  );
};

export const filterBooksByCondition = (books: Book[], condition?: "new" | "old"): Book[] => {
  if (!condition) return books;
  return books.filter(book => book.condition === condition);
};

export const filterBooksByGenre = (books: Book[], genre: string): Book[] => {
  if (genre === "All Genres") return books;
  return books.filter(book => book.genre === genre);
};

export const sortBooks = (books: Book[], sortBy: string): Book[] => {
  switch (sortBy) {
    case "price-low":
      return [...books].sort((a, b) => a.price - b.price);
    case "price-high":
      return [...books].sort((a, b) => b.price - a.price);
    case "rating":
      return [...books].sort((a, b) => b.rating - a.rating);
    case "title":
      return [...books].sort((a, b) => a.title.localeCompare(b.title));
    case "author":
      return [...books].sort((a, b) => a.author.localeCompare(b.author));
    default:
      return books;
  }
};