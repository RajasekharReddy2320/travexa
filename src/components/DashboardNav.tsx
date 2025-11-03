import { Link, useLocation, useNavigate } from "react-router-dom";
import { Search, User, Plane, Compass, UserCheck, Ticket, ShoppingCart, Menu, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { useCart } from "@/contexts/CartContext";

const DashboardNav = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [isNavExpanded, setIsNavExpanded] = useState(true);
  const { itemCount } = useCart();

  const isActive = (path: string) => location.pathname === path;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <nav className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center gap-4 px-4">
        {/* Logo */}
        <Link to="/dashboard" className="flex items-center gap-2 font-bold text-xl group">
          <div className="relative">
            <Plane className="h-6 w-6 text-primary animate-pulse" />
            <div className="absolute inset-0 animate-spin-slow opacity-30">
              <Plane className="h-6 w-6 text-primary" />
            </div>
          </div>
          <span className="hidden sm:inline-block">
            Trave<span className="text-primary">X</span>a
          </span>
        </Link>

        {/* Search Box */}
        <form onSubmit={handleSearch} className="flex-1 max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search users, destinations..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </form>

        {/* Navigation Tabs */}
        {isNavExpanded && (
          <div className="flex items-center gap-1">
            <Link
              to="/dashboard"
              className={`flex items-center gap-2 px-3 py-2 rounded-md transition-colors ${
                isActive("/dashboard")
                  ? "bg-accent text-accent-foreground"
                  : "hover:bg-accent/50"
              }`}
            >
              <Plane className="h-4 w-4" />
              <span className="hidden lg:inline-block">Home</span>
            </Link>

            <Link
              to="/wanderlust"
              className={`flex items-center gap-2 px-3 py-2 rounded-md transition-colors ${
                isActive("/wanderlust")
                  ? "bg-accent text-accent-foreground"
                  : "hover:bg-accent/50"
              }`}
            >
              <Compass className="h-4 w-4" />
              <span className="hidden lg:inline-block">Wanderlust</span>
            </Link>

            <Link
              to="/connections"
              className={`flex items-center gap-2 px-3 py-2 rounded-md transition-colors ${
                isActive("/connections")
                  ? "bg-accent text-accent-foreground"
                  : "hover:bg-accent/50"
              }`}
            >
              <UserCheck className="h-4 w-4" />
              <span className="hidden lg:inline-block">Connections</span>
            </Link>

            <Link
              to="/book-transport"
              className={`flex items-center gap-2 px-3 py-2 rounded-md transition-colors bg-secondary text-secondary-foreground hover:bg-secondary/90`}
            >
              <Ticket className="h-4 w-4" />
              <span className="hidden lg:inline-block">Book Tickets</span>
            </Link>

            <Link
              to="/my-tickets"
              className={`flex items-center gap-2 px-3 py-2 rounded-md transition-colors ${
                isActive("/my-tickets")
                  ? "bg-accent text-accent-foreground"
                  : "hover:bg-accent/50"
              }`}
            >
              <Ticket className="h-4 w-4" />
              <span className="hidden lg:inline-block">My Tickets</span>
            </Link>

            <Link
              to="/cart"
              className="relative flex items-center gap-2 px-3 py-2 rounded-md transition-colors hover:bg-accent/50"
            >
              <ShoppingCart className="h-4 w-4" />
              {itemCount > 0 && (
                <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs">
                  {itemCount}
                </Badge>
              )}
              <span className="hidden lg:inline-block">Cart</span>
            </Link>

            <Link
              to="/profile"
              className={`flex items-center gap-2 px-3 py-2 rounded-md transition-colors ${
                isActive("/profile")
                  ? "bg-accent text-accent-foreground"
                  : "hover:bg-accent/50"
              }`}
            >
              <User className="h-4 w-4" />
              <span className="hidden lg:inline-block">Profile</span>
            </Link>
          </div>
        )}

        {/* Toggle Button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsNavExpanded(!isNavExpanded)}
          className="group relative"
        >
          <div className="group-hover:opacity-0 transition-opacity">
            {isNavExpanded ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </div>
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <Menu className="h-5 w-5" />
          </div>
        </Button>
      </div>
    </nav>
  );
};

export default DashboardNav;