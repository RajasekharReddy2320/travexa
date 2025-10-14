import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X, Plane } from "lucide-react";
import { Link } from "react-router-dom";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2">
            <Plane className="h-6 w-6 text-accent" />
            <span className="text-xl font-bold text-foreground">Travexa</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            <Link to="/" className="text-foreground hover:text-accent transition-colors">
              Home
            </Link>
            <Link to="/destinations" className="text-foreground hover:text-accent transition-colors">
              Destinations
            </Link>
            <Link to="/about" className="text-foreground hover:text-accent transition-colors">
              About
            </Link>
            <Link to="/contact" className="text-foreground hover:text-accent transition-colors">
              Contact
            </Link>
          </div>

          <div className="hidden md:flex items-center gap-4">
            <Button variant="ghost" asChild>
              <Link to="/auth">Sign In</Link>
            </Button>
            <Button asChild>
              <Link to="/auth">Get Started</Link>
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-foreground"
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle menu"
          >
            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden py-4 border-t border-border">
            <div className="flex flex-col gap-4">
              <Link
                to="/"
                className="text-foreground hover:text-accent transition-colors"
                onClick={() => setIsOpen(false)}
              >
                Home
              </Link>
              <Link
                to="/destinations"
                className="text-foreground hover:text-accent transition-colors"
                onClick={() => setIsOpen(false)}
              >
                Destinations
              </Link>
              <Link
                to="/about"
                className="text-foreground hover:text-accent transition-colors"
                onClick={() => setIsOpen(false)}
              >
                About
              </Link>
              <Link
                to="/contact"
                className="text-foreground hover:text-accent transition-colors"
                onClick={() => setIsOpen(false)}
              >
                Contact
              </Link>
              <div className="flex flex-col gap-2 pt-4">
                <Button variant="ghost" asChild onClick={() => setIsOpen(false)}>
                  <Link to="/auth">Sign In</Link>
                </Button>
                <Button asChild onClick={() => setIsOpen(false)}>
                  <Link to="/auth">Get Started</Link>
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
