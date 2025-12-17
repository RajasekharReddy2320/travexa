import { Link, useLocation, useNavigate } from "react-router-dom";
import { Search, User, Plane, Compass, UserCheck, Ticket, ShoppingCart, Menu, X, MessageSquare } from "lucide-react";
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
      <div className="container flex h-16 items-center gap-2 px-4">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 font-bold text-xl group shrink-0">
          <Plane className="h-6 w-6 text-accent transition-transform group-hover:rotate-12" />
          <span className="hidden sm:inline-block">
            Trave<span className="text-accent">X</span>a
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
          <div className="flex items-center gap-0.5 overflow-hidden text-[11px] lg:text-xs xl:text-sm">
            <Link
              to="/"
              className={`flex items-center gap-1 px-1.5 lg:px-2 py-2 rounded-md transition-colors whitespace-nowrap ${
                isActive("/")
                  ? "bg-accent text-accent-foreground"
                  : "hover:bg-accent/50"
              }`}
            >
              <Compass className="h-3.5 w-3.5 lg:h-4 lg:w-4 shrink-0" />
              <span className="hidden lg:inline-block">Wanderlust</span>
            </Link>

            <Link
              to="/travel-buddies"
              className={`flex items-center gap-1 px-1.5 lg:px-2 py-2 rounded-md transition-colors whitespace-nowrap ${
                isActive("/travel-buddies")
                  ? "bg-accent text-accent-foreground"
                  : "hover:bg-accent/50"
              }`}
            >
              <UserCheck className="h-3.5 w-3.5 lg:h-4 lg:w-4 shrink-0" />
              <span className="hidden lg:inline-block">Travel Buddies</span>
            </Link>

            <Link
              to="/plan-trip"
              className={`flex items-center gap-1 px-1.5 lg:px-2 py-2 rounded-md transition-colors whitespace-nowrap ${
                isActive("/plan-trip")
                  ? "bg-accent text-accent-foreground"
                  : "hover:bg-accent/50"
              }`}
            >
              <Plane className="h-3.5 w-3.5 lg:h-4 lg:w-4 shrink-0" />
              <span className="hidden lg:inline-block">Trip Planner</span>
            </Link>

            <Link
              to="/book-transport"
              className={`flex items-center gap-1 px-1.5 lg:px-2 py-2 rounded-md transition-colors whitespace-nowrap ${
                isActive("/book-transport") || isActive("/my-tickets")
                  ? "bg-accent text-accent-foreground"
                  : "hover:bg-accent/50"
              }`}
            >
              <Ticket className="h-3.5 w-3.5 lg:h-4 lg:w-4 shrink-0" />
              <span className="hidden lg:inline-block">Book Tickets</span>
            </Link>

            <Link
              to="/photo-vault"
              className={`flex items-center gap-1 px-1.5 lg:px-2 py-2 rounded-md transition-colors whitespace-nowrap ${
                isActive("/photo-vault")
                  ? "bg-accent text-accent-foreground"
                  : "hover:bg-accent/50"
              }`}
            >
              <Search className="h-3.5 w-3.5 lg:h-4 lg:w-4 shrink-0" />
              <span className="hidden lg:inline-block">Photo Vault</span>
            </Link>

            <Link
              to="/knowledge"
              className={`flex items-center gap-1 px-1.5 lg:px-2 py-2 rounded-md transition-colors whitespace-nowrap ${
                isActive("/knowledge")
                  ? "bg-accent text-accent-foreground"
                  : "hover:bg-accent/50"
              }`}
            >
              <MessageSquare className="h-3.5 w-3.5 lg:h-4 lg:w-4 shrink-0" />
              <span className="hidden lg:inline-block">Knowledge</span>
            </Link>

            <Link
              to="/cart"
              className="relative flex items-center gap-1 px-1.5 lg:px-2 py-2 rounded-md transition-colors hover:bg-accent/50 whitespace-nowrap"
            >
              <ShoppingCart className="h-3.5 w-3.5 lg:h-4 lg:w-4 shrink-0" />
              {itemCount > 0 && (
                <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs">
                  {itemCount}
                </Badge>
              )}
              <span className="hidden lg:inline-block">Cart</span>
            </Link>

            <Link
              to="/profile"
              className={`flex items-center gap-1 px-1.5 lg:px-2 py-2 rounded-md transition-colors whitespace-nowrap ${
                isActive("/profile")
                  ? "bg-accent text-accent-foreground"
                  : "hover:bg-accent/50"
              }`}
            >
              <User className="h-3.5 w-3.5 lg:h-4 lg:w-4 shrink-0" />
              <span className="hidden lg:inline-block">Profile</span>
            </Link>
          </div>
        )}

        {/* Toggle Button - always at far right */}
        <div className="ml-auto shrink-0">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsNavExpanded(!isNavExpanded)}
          >
            {isNavExpanded ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>
    </nav>
  );
};

export default DashboardNav;