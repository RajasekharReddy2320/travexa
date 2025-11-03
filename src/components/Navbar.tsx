import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Plane } from "lucide-react";

const Navbar = () => {
  return (
    <nav className="border-b border-border bg-background">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2 text-2xl font-bold text-foreground hover:text-accent transition-colors group">
            <div className="relative">
              <Plane className="h-6 w-6 text-primary animate-pulse" />
              <div className="absolute inset-0 animate-spin-slow opacity-30">
                <Plane className="h-6 w-6 text-primary" />
              </div>
            </div>
            <span>Trave<span className="text-primary">X</span>a</span>
          </Link>

          <div className="flex items-center gap-3">
            <Button variant="ghost" asChild>
              <Link to="/login">Login</Link>
            </Button>
            <Button asChild>
              <Link to="/signup">Sign Up</Link>
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
