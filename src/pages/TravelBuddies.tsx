import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import DashboardNav from "@/components/DashboardNav";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Search, MapPin, Users, UserPlus, MessageCircle, UserCheck, Calendar } from "lucide-react";

interface SearchResult {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  interests: string[] | null;
  home_location: string | null;
  connection_status: string;
}

const TravelBuddies = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [destination, setDestination] = useState("");
  const [interest, setInterest] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) setCurrentUserId(user.id);
  };

  const performSearch = async () => {
    if (!currentUserId) return;
    
    setLoading(true);
    try {
      let query = supabase
        .from("profiles")
        .select("*")
        .neq("id", currentUserId);

      if (searchQuery.trim()) {
        query = query.ilike("full_name", `%${searchQuery}%`);
      }

      if (destination.trim()) {
        query = query.or(`home_location.ilike.%${destination}%,country.ilike.%${destination}%,state.ilike.%${destination}%`);
      }

      if (interest) {
        query = query.contains("interests", [interest]);
      }

      const { data: profiles, error } = await query.limit(20);

      if (error) throw error;

      const profilesWithStatus = await Promise.all(
        (profiles || []).map(async (profile) => {
          const { data: statusData } = await supabase.rpc("get_connection_status", {
            user1_id: currentUserId,
            user2_id: profile.id,
          });

          return {
            ...profile,
            connection_status: statusData || "none",
          };
        })
      );

      setSearchResults(profilesWithStatus);
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

  return (
    <div className="min-h-screen bg-background">
      <DashboardNav />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Travel Buddies</h1>
          <p className="text-muted-foreground">Find and connect with fellow travelers</p>
        </div>

        <Tabs defaultValue="find" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="find">
              <Search className="h-4 w-4 mr-2" />
              Find Buddies
            </TabsTrigger>
            <TabsTrigger value="nearby">
              <MapPin className="h-4 w-4 mr-2" />
              Nearby
            </TabsTrigger>
            <TabsTrigger value="travel-with-me">
              <Users className="h-4 w-4 mr-2" />
              Travel With Me
            </TabsTrigger>
            <TabsTrigger value="travel-groups">
              <Users className="h-4 w-4 mr-2" />
              Travel Groups
            </TabsTrigger>
          </TabsList>

          <TabsContent value="find" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Search for Travel Buddies</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 mb-6">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Search by name..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="flex-1"
                    />
                    <Button onClick={performSearch} disabled={loading}>
                      <Search className="h-4 w-4 mr-2" />
                      {loading ? "Searching..." : "Search"}
                    </Button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      placeholder="Filter by destination..."
                      value={destination}
                      onChange={(e) => setDestination(e.target.value)}
                    />
                    <Select value={interest} onValueChange={setInterest}>
                      <SelectTrigger>
                        <SelectValue placeholder="Filter by interest" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="adventure">Adventure</SelectItem>
                        <SelectItem value="beach">Beach</SelectItem>
                        <SelectItem value="culture">Culture</SelectItem>
                        <SelectItem value="food">Food</SelectItem>
                        <SelectItem value="hiking">Hiking</SelectItem>
                        <SelectItem value="photography">Photography</SelectItem>
                        <SelectItem value="wildlife">Wildlife</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {searchResults.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <Users className="h-16 w-16 mx-auto mb-4 opacity-50" />
                    <p>Start searching to find travel buddies with similar interests</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {searchResults.map((result) => (
                      <Card key={result.id} className="hover:shadow-lg transition-shadow">
                        <CardHeader className="pb-3">
                          <div className="flex items-center gap-3">
                            <Avatar 
                              className="h-12 w-12 cursor-pointer" 
                              onClick={() => navigate(`/profile/${result.id}`)}
                            >
                              <AvatarImage src={result.avatar_url || undefined} />
                              <AvatarFallback>{getInitials(result.full_name)}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <CardTitle 
                                className="text-base cursor-pointer hover:underline truncate"
                                onClick={() => navigate(`/profile/${result.id}`)}
                              >
                                {result.full_name || "Anonymous"}
                              </CardTitle>
                              {result.home_location && (
                                <p className="text-sm text-muted-foreground flex items-center gap-1 truncate">
                                  <MapPin className="h-3 w-3" />
                                  {result.home_location}
                                </p>
                              )}
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          {result.bio && (
                            <p className="text-sm text-muted-foreground line-clamp-2">{result.bio}</p>
                          )}
                          {result.interests && result.interests.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                              {result.interests.slice(0, 3).map((int, idx) => (
                                <Badge key={idx} variant="outline" className="text-xs">
                                  {int}
                                </Badge>
                              ))}
                            </div>
                          )}
                          <div className="flex gap-2">
                            {result.connection_status === "connected" ? (
                              <>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="flex-1"
                                  onClick={() => navigate(`/messages?user=${result.id}`)}
                                >
                                  <MessageCircle className="h-4 w-4 mr-1" />
                                  Message
                                </Button>
                                <Button variant="outline" size="sm" disabled>
                                  <UserCheck className="h-4 w-4 mr-1" />
                                  Connected
                                </Button>
                              </>
                            ) : result.connection_status === "pending_sent" ? (
                              <Button variant="outline" size="sm" className="flex-1" disabled>
                                Pending
                              </Button>
                            ) : (
                              <Button
                                size="sm"
                                className="flex-1"
                                onClick={() => sendConnectionRequest(result.id)}
                              >
                                <UserPlus className="h-4 w-4 mr-1" />
                                Connect
                              </Button>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="nearby" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Travelers Nearby</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12 text-muted-foreground">
                  <MapPin className="h-16 w-16 mx-auto mb-4 opacity-50" />
                  <p>Enable location to find travelers near you</p>
                  <Button className="mt-4">Enable Location</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="travel-with-me" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Post Your Travel Plans</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12 text-muted-foreground">
                  <Users className="h-16 w-16 mx-auto mb-4 opacity-50" />
                  <p>Share your travel plans and invite others to join you</p>
                  <Button className="mt-4">Create Travel Plan</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="travel-groups" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Travel Groups</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12 text-muted-foreground">
                  <Users className="h-16 w-16 mx-auto mb-4 opacity-50" />
                  <p>Browse and join travel groups with similar interests</p>
                  <Button className="mt-4">Explore Groups</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default TravelBuddies;
