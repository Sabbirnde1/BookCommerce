import { BookOpen, Mail, Phone, Clock, Facebook, Linkedin, Youtube, Video, MessageCircle, Send } from "lucide-react";
import { Link } from "react-router-dom";

export function Footer() {
  return (
    <footer className="bg-primary text-primary-foreground py-12">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-8">
          <div>
          <div className="flex items-center space-x-3 mb-4 hover:scale-105 transition-transform duration-200">
            <div className="relative">
              <img 
                src="/lovable-uploads/848411c9-0b2c-45e9-a022-488d67f663e4.png" 
                alt="Nijercart Logo" 
                className="h-12 w-auto drop-shadow-lg hover:drop-shadow-xl transition-all duration-200 brightness-0 invert"
              />
              <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-primary-foreground/5 rounded-lg"></div>
            </div>
            <div>
              <div className="text-lg font-bold text-primary-foreground drop-shadow-lg">Nijer Cart</div>
            </div>
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
            <h4 className="font-semibold mb-4">Book Categories</h4>
            <ul className="space-y-2 text-primary-foreground/80">
              <li><Link to="/books?category=fiction" className="hover:text-primary-foreground transition-colors">Fiction</Link></li>
              <li><Link to="/books?category=non-fiction" className="hover:text-primary-foreground transition-colors">Non-Fiction</Link></li>
              <li><Link to="/books?category=academic" className="hover:text-primary-foreground transition-colors">Academic</Link></li>
              <li><Link to="/books?category=children" className="hover:text-primary-foreground transition-colors">Children's Books</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Contact</h4>
            <ul className="space-y-2 text-primary-foreground/80">
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                nijercart@gmail.com
              </li>
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                +880 18 259 29393
              </li>
              <li className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Daily: 9AM-9PM
              </li>
            </ul>
          </div>
          
          {/* Social Media Section */}
          <div>
            <h4 className="font-semibold mb-4">Follow Us</h4>
            <div className="flex space-x-4">
              <a 
                href="https://www.facebook.com/share/1GYpemSse3/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-10 h-10 bg-primary-foreground/10 rounded-full flex items-center justify-center hover:bg-primary-foreground/20 transition-colors duration-200 group"
              >
                <Facebook className="h-5 w-5 text-primary-foreground group-hover:scale-110 transition-transform duration-200" />
              </a>
              <a 
                href="https://linkedin.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-10 h-10 bg-primary-foreground/10 rounded-full flex items-center justify-center hover:bg-primary-foreground/20 transition-colors duration-200 group"
              >
                <Linkedin className="h-5 w-5 text-primary-foreground group-hover:scale-110 transition-transform duration-200" />
              </a>
             
              <a 
                href="https://wa.me/8801825929393" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-10 h-10 bg-primary-foreground/10 rounded-full flex items-center justify-center hover:bg-primary-foreground/20 transition-colors duration-200 group"
              >
                <MessageCircle className="h-5 w-5 text-primary-foreground group-hover:scale-110 transition-transform duration-200" />
              </a>
              <a 
                href="https://t.me/nijercart" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-10 h-10 bg-primary-foreground/10 rounded-full flex items-center justify-center hover:bg-primary-foreground/20 transition-colors duration-200 group"
              >
                <Send className="h-5 w-5 text-primary-foreground group-hover:scale-110 transition-transform duration-200" />
              </a>
            </div>
          </div>
        </div>
        
        <div className="border-t border-primary-foreground/20 mt-8 pt-8 text-center text-primary-foreground/80">
          <p>&copy; 2025 <span className="font-semibold text-primary-foreground">Nijer Cart</span>. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}