import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import DashboardNav from "@/components/DashboardNav";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Heart, Bookmark, MapPin, Calendar, Users, Search, MessageCircle } from "lucide-react";
import { format } from "date-fns";

interface Profile {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  home_location: string | null;
}

interface PublicTrip {
  id: string;
  title: string;
  destination: string;
  start_date: string;
  end_date: string;
  budget_inr: number | null;
  group_size: number;
  image_url: string | null;
  likes_count: number;
  user_id: string;
  profiles: Profile;
  isLiked?: boolean;
  isSaved?: boolean;
}

const Wanderlust = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<Profile[]>([]);
  const [publicTrips, setPublicTrips] = useState<PublicTrip[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentUserId, setCurrentUserId] = useState<string>("");

  useEffect(() => {
    checkAuthAndLoad();
  }, []);

  const checkAuthAndLoad = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      navigate("/login");
      return;
    }

    setCurrentUserId(session.user.id);
    await Promise.all([loadUsers(), loadPublicTrips()]);
    setLoading(false);
  };

  const loadUsers = async () => {
    const { data, error } = await supabase
      .from("profiles")
      .select("id, full_name, avatar_url, home_location")
      .limit(20);

    if (error) {
      console.error("Error loading users:", error);
      return;
    }

    setUsers(data || []);
  };

  const loadPublicTrips = async () => {
    const { data, error } = await supabase
      .from("trips")
      .select("*")
      .eq("is_public", true)
      .order("created_at", { ascending: false })
      .limit(50);

    if (error) {
      console.error("Error loading public trips:", error);
      return;
    }

    if (!data || data.length === 0) {
      setPublicTrips([]);
      return;
    }

    // Load profiles for all trips
    const userIds = [...new Set(data.map(trip => trip.user_id))];
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, full_name, avatar_url, home_location")
      .in("id", userIds);

    const profileMap = new Map(profiles?.map(p => [p.id, p]) || []);

    // Check likes and saves for current user
    let likedIds = new Set<string>();
    let savedIds = new Set<string>();

    if (currentUserId) {
      const { data: likes } = await supabase
        .from("trip_likes")
        .select("trip_id")
        .eq("user_id", currentUserId);

      const { data: saves } = await supabase
        .from("bucket_list")
        .select("trip_id")
        .eq("user_id", currentUserId);

      likedIds = new Set(likes?.map(l => l.trip_id) || []);
      savedIds = new Set(saves?.map(s => s.trip_id) || []);
    }

    const enrichedTrips: PublicTrip[] = data.map(trip => ({
      ...trip,
      profiles: profileMap.get(trip.user_id) || {
        id: trip.user_id,
        full_name: null,
        avatar_url: null,
        home_location: null,
      },
      isLiked: likedIds.has(trip.id),
      isSaved: savedIds.has(trip.id),
    }));

    setPublicTrips(enrichedTrips);
  };

  const handleLike = async (tripId: string) => {
    const trip = publicTrips.find(t => t.id === tripId);
    if (!trip) return;

    if (trip.isLiked) {
      // Unlike
      await supabase
        .from("trip_likes")
        .delete()
        .eq("trip_id", tripId)
        .eq("user_id", currentUserId);

      await supabase
        .from("trips")
        .update({ likes_count: (trip.likes_count || 1) - 1 })
        .eq("id", tripId);
    } else {
      // Like
      await supabase
        .from("trip_likes")
        .insert({ trip_id: tripId, user_id: currentUserId });

      await supabase
        .from("trips")
        .update({ likes_count: (trip.likes_count || 0) + 1 })
        .eq("id", tripId);
    }

    // Reload trips
    loadPublicTrips();
  };

  const handleSave = async (tripId: string) => {
    const trip = publicTrips.find(t => t.id === tripId);
    if (!trip) return;

    if (trip.isSaved) {
      // Remove from bucket list
      await supabase
        .from("bucket_list")
        .delete()
        .eq("trip_id", tripId)
        .eq("user_id", currentUserId);

      toast({
        title: "Removed from bucket list",
        description: "Trip removed from your saved travels"
      });
    } else {
      // Add to bucket list
      await supabase
        .from("bucket_list")
        .insert({ trip_id: tripId, user_id: currentUserId });

      toast({
        title: "Saved to bucket list",
        description: "Trip added to your travel bucket list"
      });
    }

    // Reload trips
    loadPublicTrips();
  };

  const handleMessage = (userId: string) => {
    navigate("/messages", { state: { userId } });
  };

  const filteredUsers = users.filter(user =>
    user.full_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getInitials = (name: string | null) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-center">
          <MapPin className="h-12 w-12 mx-auto mb-4 text-primary animate-bounce" />
          <p className="text-muted-foreground">Loading wanderlust...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <DashboardNav />

      <main className="container px-4 py-8 max-w-6xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Wanderlust</h1>
          <p className="text-muted-foreground">Discover travelers and their amazing journeys</p>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search travelers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Users horizontal scroll */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Travelers</h2>
          <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
            {filteredUsers.map((user) => (
              <div
                key={user.id}
                className="flex flex-col items-center cursor-pointer min-w-[80px]"
                onClick={() => navigate(`/profile/${user.id}`)}
              >
                <Avatar className="h-16 w-16 border-2 border-primary">
                  <AvatarImage src={user.avatar_url || undefined} />
                  <AvatarFallback>{getInitials(user.full_name)}</AvatarFallback>
                </Avatar>
                <p className="text-xs mt-2 text-center truncate w-full">{user.full_name || "User"}</p>
                {user.home_location && (
                  <p className="text-xs text-muted-foreground truncate w-full text-center">{user.home_location}</p>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Public trips feed */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Explore Trips</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {publicTrips.map((trip) => (
              <Card key={trip.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                {trip.image_url && (
                  <div className="h-48 overflow-hidden">
                    <img
                      src={trip.image_url}
                      alt={trip.destination}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3 mb-3">
                    <Avatar className="h-10 w-10 cursor-pointer" onClick={() => navigate(`/profile/${trip.user_id}`)}>
                      <AvatarImage src={trip.profiles?.avatar_url || undefined} />
                      <AvatarFallback>{getInitials(trip.profiles?.full_name)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="font-semibold text-sm">{trip.profiles?.full_name || "User"}</p>
                      {trip.profiles?.home_location && (
                        <p className="text-xs text-muted-foreground">{trip.profiles.home_location}</p>
                      )}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleMessage(trip.user_id)}
                    >
                      <MessageCircle className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <CardTitle className="text-xl">{trip.title}</CardTitle>
                  <CardDescription className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    {trip.destination}
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-2">
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {format(new Date(trip.start_date), "MMM d")} - {format(new Date(trip.end_date), "MMM d, yyyy")}
                    </div>
                    {trip.group_size > 1 && (
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        {trip.group_size} travelers
                      </div>
                    )}
                  </div>

                  {trip.budget_inr && (
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">
                        ₹{trip.budget_inr.toLocaleString()} INR
                      </Badge>
                    </div>
                  )}
                </CardContent>

                <CardFooter className="flex justify-between pt-0">
                  <Button
                    variant={trip.isLiked ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleLike(trip.id)}
                    className="gap-2"
                  >
                    <Heart className={`h-4 w-4 ${trip.isLiked ? "fill-current" : ""}`} />
                    {trip.likes_count || 0}
                  </Button>
                  
                  <Button
                    variant={trip.isSaved ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleSave(trip.id)}
                    className="gap-2"
                  >
                    <Bookmark className={`h-4 w-4 ${trip.isSaved ? "fill-current" : ""}`} />
                    {trip.isSaved ? "Saved" : "Save"}
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>

          {publicTrips.length === 0 && (
            <Card>
              <CardContent className="py-12 text-center">
                <MapPin className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                <p className="text-lg text-muted-foreground mb-2">No public trips yet</p>
                <p className="text-sm text-muted-foreground">
                  Be the first to share your travel adventures!
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
};

export default Wanderlust;