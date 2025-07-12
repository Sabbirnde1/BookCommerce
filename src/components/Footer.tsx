import { BookOpen, Mail, Phone, Clock } from "lucide-react";
import { Link } from "react-router-dom";

export function Footer() {
  return (
    <footer className="bg-primary text-primary-foreground py-12">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-4 gap-8">
          <div>
          <div className="flex items-center space-x-3 mb-4">
            <img 
              src="/lovable-uploads/848411c9-0b2c-45e9-a022-488d67f663e4.png" 
              alt="Nijercart Logo" 
              className="h-10 w-auto brightness-0 invert"
            />
            <div className="text-xl font-bold text-primary-foreground">Nijercart</div>
          </div>
            <p className="text-primary-foreground/80 max-w-xs">
              Your trusted destination for both new and pre-owned books in Bangladesh. Discover, learn, and grow with Nijercart.
            </p>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-primary-foreground/80">
              <li><Link to="/books" className="hover:text-primary-foreground transition-colors">All Books</Link></li>
              <li><Link to="/new-books" className="hover:text-primary-foreground transition-colors">New Books</Link></li>
              <li><Link to="/old-books" className="hover:text-primary-foreground transition-colors">Old Books</Link></li>
              <li><Link to="/request" className="hover:text-primary-foreground transition-colors">Request a Book</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Categories</h4>
            <ul className="space-y-2 text-primary-foreground/80">
              <li><Link to="/books?genre=fiction" className="hover:text-primary-foreground transition-colors">Fiction</Link></li>
              <li><Link to="/books?genre=non-fiction" className="hover:text-primary-foreground transition-colors">Non-Fiction</Link></li>
              <li><Link to="/books?genre=science" className="hover:text-primary-foreground transition-colors">Science</Link></li>
              <li><Link to="/books?genre=biography" className="hover:text-primary-foreground transition-colors">Biography</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Contact</h4>
            <ul className="space-y-2 text-primary-foreground/80">
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                support@nijercart.com
              </li>
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                +880 1234-567890
              </li>
              <li className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Daily: 9AM-9PM
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-primary-foreground/20 mt-8 pt-8 text-center text-primary-foreground/80">
          <p>&copy; 2024 Nijer Cart. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}