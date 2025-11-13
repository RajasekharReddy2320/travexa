import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import DashboardNav from "@/components/DashboardNav";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Search, UserPlus, MessageCircle, UserCheck, Clock } from "lucide-react";

interface Profile {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  interests: string[] | null;
  is_public: boolean;
}

interface SearchResult extends Profile {
  connection_status: string;
  can_message: boolean;
}

const SearchUsers = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate("/login");
      return;
    }
    setCurrentUserId(user.id);
  };

  const performSearch = async () => {
    if (!searchQuery.trim() || !currentUserId) return;

    setLoading(true);
    try {
      const { data: profiles, error } = await supabase
        .from("profiles")
        .select("*")
        .or(`full_name.ilike.%${searchQuery}%,interests.cs.{${searchQuery}}`)
        .neq("id", currentUserId)
        .limit(20);

      if (error) throw error;

      const profilesWithStatus = await Promise.all(
        (profiles || []).map(async (profile) => {
          const { data: statusData } = await supabase
            .rpc("get_connection_status", {
              user1_id: currentUserId,
              user2_id: profile.id,
            });

          const canMessage = statusData === "connected" || profile.is_public;

          return {
            ...profile,
            connection_status: statusData || "none",
            can_message: canMessage,
          };
        })
      );

      setResults(profilesWithStatus);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const sendConnectionRequest = async (targetUserId: string) => {
    if (!currentUserId) return;

    try {
      const { error } = await supabase.from("user_connections").insert({
        requester_id: currentUserId,
        addressee_id: targetUserId,
        status: "pending",
      });

      if (error) throw error;

      toast({
        title: "Request Sent",
        description: "Connection request sent successfully",
      });

      performSearch();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const getInitials = (name: string | null) => {
    if (!name) return "U";
    return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    performSearch();
  };

  const renderConnectionButton = (result: SearchResult) => {
    switch (result.connection_status) {
      case "connected":
        return (
          <Button variant="outline" disabled>
            <UserCheck className="h-4 w-4 mr-2" />
            Connected
          </Button>
        );
      case "pending_sent":
        return (
          <Button variant="outline" disabled>
            <Clock className="h-4 w-4 mr-2" />
            Request Sent
          </Button>
        );
      case "pending_received":
        return (
          <Button variant="outline" disabled>
            <Clock className="h-4 w-4 mr-2" />
            Request Received
          </Button>
        );
      default:
        return (
          <Button onClick={() => sendConnectionRequest(result.id)}>
            <UserPlus className="h-4 w-4 mr-2" />
            Connect
          </Button>
        );
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <DashboardNav />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Search Users</h1>
          <p className="text-muted-foreground">Find and connect with travelers</p>
        </div>

        <Card className="mb-6">
          <CardContent className="pt-6">
            <form onSubmit={handleSearch} className="flex gap-2">
              <Input
                placeholder="Search by name or interests..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1"
              />
              <Button type="submit" disabled={loading}>
                <Search className="h-4 w-4 mr-2" />
                {loading ? "Searching..." : "Search"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {results.length === 0 && !loading && searchQuery && (
          <div className="text-center py-12 text-muted-foreground">
            <p>No users found matching "{searchQuery}"</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {results.map((result) => (
            <Card key={result.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <Avatar className="h-12 w-12 cursor-pointer" onClick={() => navigate(`/profile/${result.id}`)}>
                    <AvatarImage src={result.avatar_url || undefined} />
                    <AvatarFallback>{getInitials(result.full_name)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <CardTitle 
                      className="text-base cursor-pointer hover:underline"
                      onClick={() => navigate(`/profile/${result.id}`)}
                    >
                      {result.full_name || "Anonymous"}
                    </CardTitle>
                    {result.connection_status === "connected" && (
                      <Badge variant="secondary" className="mt-1">Connected</Badge>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {result.connection_status === "connected" && (
                  <>
                    {result.bio && (
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {result.bio}
                      </p>
                    )}
                    {result.interests && result.interests.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {result.interests.slice(0, 3).map((interest, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs">
                            {interest}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </>
                )}
                {result.connection_status !== "connected" && (
                  <p className="text-sm text-muted-foreground">
                    Connect to see full profile
                  </p>
                )}
                <div className="flex gap-2">
                  {result.can_message && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => navigate(`/messages?user=${result.id}`)}
                    >
                      <MessageCircle className="h-4 w-4 mr-1" />
                      Message
                    </Button>
                  )}
                  {renderConnectionButton(result)}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SearchUsers;
