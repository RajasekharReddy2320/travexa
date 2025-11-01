import { Link, useLocation, useNavigate } from "react-router-dom";
import { Search, MessageSquare, User, Plane, Compass, UserCheck } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useState } from "react";

const DashboardNav = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");

  const isActive = (path: string) => location.pathname === path;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <nav className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center gap-6 px-4">
        {/* Logo */}
        <Link to="/dashboard" className="flex items-center gap-2 font-bold text-xl">
          <Plane className="h-6 w-6 text-primary" />
          <span className="hidden sm:inline-block">Travexa</span>
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
        <div className="flex items-center gap-1">
          <Link
            to="/dashboard"
            className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
              isActive("/dashboard")
                ? "bg-accent text-accent-foreground"
                : "hover:bg-accent/50"
            }`}
          >
            <Plane className="h-4 w-4" />
            <span className="hidden sm:inline-block">Travexa</span>
          </Link>

          <Link
            to="/wanderlust"
            className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
              isActive("/wanderlust")
                ? "bg-accent text-accent-foreground"
                : "hover:bg-accent/50"
            }`}
          >
            <Compass className="h-4 w-4" />
            <span className="hidden sm:inline-block">Wanderlust</span>
          </Link>

          <Link
            to="/connections"
            className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
              isActive("/connections")
                ? "bg-accent text-accent-foreground"
                : "hover:bg-accent/50"
            }`}
          >
            <UserCheck className="h-4 w-4" />
            <span className="hidden sm:inline-block">Connections</span>
          </Link>

          <Link
            to="/messages"
            className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
              isActive("/messages")
                ? "bg-accent text-accent-foreground"
                : "hover:bg-accent/50"
            }`}
          >
            <MessageSquare className="h-4 w-4" />
            <span className="hidden sm:inline-block">Messages</span>
          </Link>

          <Link
            to="/profile"
            className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
              isActive("/profile")
                ? "bg-accent text-accent-foreground"
                : "hover:bg-accent/50"
            }`}
          >
            <User className="h-4 w-4" />
            <span className="hidden sm:inline-block">Profile</span>
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default DashboardNav;