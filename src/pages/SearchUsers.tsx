import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import DashboardNav from "@/components/DashboardNav";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Search, UserPlus, MessageCircle, UserCheck, Lock } from "lucide-react";

interface Profile {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  interests: string[] | null;
  is_public: boolean;
}

interface SearchResult extends Profile {
  connectionStatus: string;
  canMessage: boolean;
}

const SearchUsers = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [currentUserId, setCurrentUserId] = useState("");
  const [searchQuery, setSearchQuery] = useState(searchParams.get("q") || "");
  const [results, setResults] = useState<SearchResult[]>([]);

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (searchQuery) {
      performSearch();
    }
  }, [searchQuery, currentUserId]);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      navigate("/login");
      return;
    }

    setCurrentUserId(session.user.id);
  };

  const performSearch = async () => {
    if (!currentUserId || !searchQuery) return;

    setLoading(true);

    try {
      // Security: Use public_profiles view to avoid exposing email/phone
      const { data: profiles, error } = await supabase
        .from("public_profiles")
        .select("*")
        .neq("id", currentUserId)
        .or(`full_name.ilike.%${searchQuery}%,interests.cs.{${searchQuery}}`)
        .limit(20);

      if (error) throw error;

      // Get connection statuses for all results
      const resultsWithStatus = await Promise.all(
        (profiles || []).map(async (profile) => {
          const { data: statusData } = await supabase.rpc('get_connection_status', {
            user1_id: currentUserId,
            user2_id: profile.id
          });

          const connectionStatus = statusData || 'none';
          const canMessage = profile.is_public || connectionStatus === 'connected';

          return {
            ...profile,
            connectionStatus,
            canMessage
          };
        })
      );

      setResults(resultsWithStatus);
    } catch (error) {
      // Security: Don't log detailed errors
      toast({
        title: "Error",
        description: "Failed to search users",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const sendConnectionRequest = async (userId: string) => {
    const { error } = await supabase
      .from("user_connections")
      .insert({
        requester_id: currentUserId,
        addressee_id: userId,
        status: "pending"
      });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to send connection request",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "Request Sent",
      description: "Connection request sent successfully"
    });

    performSearch(); // Refresh results
  };

  const getInitials = (name: string | null) => {
    if (!name) return "U";
    return name.split(" ").map(n => n[0]).join("").toUpperCase();
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    performSearch();
  };

  return (
    <div className="min-h-screen bg-background">
      <DashboardNav />

      <main className="container px-4 py-8 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-4">Search Travelers</h1>
          
          <form onSubmit={handleSearch} className="relative">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search by name or interests..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </form>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Searching...</p>
          </div>
        ) : results.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Search className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground text-center">
                {searchQuery ? "No users found" : "Start searching to find travelers"}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {results.map((profile) => (
              <Card key={profile.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="flex items-center justify-between p-6">
                  <div className="flex items-center gap-4 flex-1">
                    <Avatar 
                      className="h-16 w-16 cursor-pointer" 
                      onClick={() => navigate(`/profile/${profile.id}`)}
                    >
                      <AvatarImage src={profile.avatar_url || undefined} />
                      <AvatarFallback>{getInitials(profile.full_name)}</AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 
                          className="font-semibold text-lg cursor-pointer hover:underline"
                          onClick={() => navigate(`/profile/${profile.id}`)}
                        >
                          {profile.full_name || "User"}
                        </h3>
                        {!profile.is_public && (
                          <Lock className="h-4 w-4 text-muted-foreground" />
                        )}
                        {profile.connectionStatus === 'connected' && (
                          <Badge variant="secondary">
                            <UserCheck className="h-3 w-3 mr-1" />
                            Connected
                          </Badge>
                        )}
                        {profile.connectionStatus === 'pending_sent' && (
                          <Badge variant="outline">Request Sent</Badge>
                        )}
                        {profile.connectionStatus === 'pending_received' && (
                          <Badge>Pending</Badge>
                        )}
                      </div>
                      
                      {profile.is_public || profile.connectionStatus === 'connected' ? (
                        <>
                          {profile.bio && (
                            <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                              {profile.bio}
                            </p>
                          )}
                          {profile.interests && profile.interests.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                              {profile.interests.slice(0, 3).map((interest) => (
                                <Badge key={interest} variant="outline" className="text-xs">
                                  {interest}
                                </Badge>
                              ))}
                              {profile.interests.length > 3 && (
                                <Badge variant="outline" className="text-xs">
                                  +{profile.interests.length - 3} more
                                </Badge>
                              )}
                            </div>
                          )}
                        </>
                      ) : (
                        <p className="text-sm text-muted-foreground">
                          Private profile • Connect to view details
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2 ml-4">
                    {profile.canMessage && (
                      <Button
                        variant="outline"
                        onClick={() => navigate('/wanderlust', { state: { selectedUserId: profile.id } })}
                      >
                        <MessageCircle className="h-4 w-4 mr-2" />
                        Message
                      </Button>
                    )}
                    
                    {profile.connectionStatus === 'none' && (
                      <Button onClick={() => sendConnectionRequest(profile.id)}>
                        <UserPlus className="h-4 w-4 mr-2" />
                        Connect
                      </Button>
                    )}
                    
                    {profile.connectionStatus === 'pending_received' && (
                      <Button onClick={() => navigate('/connections')}>
                        View Request
                      </Button>
                    )}

                    {profile.connectionStatus !== 'none' && profile.connectionStatus !== 'pending_received' && !profile.canMessage && (
                      <Button variant="outline" onClick={() => navigate(`/profile/${profile.id}`)}>
                        View Profile
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default SearchUsers;
