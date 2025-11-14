import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Heart, X, MapPin, Calendar, Users } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useConnectionActions } from "@/hooks/useConnectionActions";
import DashboardNav from "@/components/DashboardNav";

interface TravelProfile {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  interests: string[] | null;
  travel_preferences: string[] | null;
  home_location: string | null;
  budget_range: string | null;
}

export default function TravelTinder() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { sendConnectionRequest } = useConnectionActions();
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [profiles, setProfiles] = useState<TravelProfile[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProfiles();
  }, []);

  const loadProfiles = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate("/login");
      return;
    }

    setCurrentUserId(user.id);

    // Load user's interests to match
    const { data: myProfile } = await supabase
      .from("profiles")
      .select("interests, travel_preferences")
      .eq("id", user.id)
      .single();

    // Get profiles with similar interests
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .neq("id", user.id)
      .eq("is_public", true)
      .limit(20);

    if (error) {
      console.error("Error loading profiles:", error);
      toast({
        title: "Error",
        description: "Failed to load travel buddies",
        variant: "destructive"
      });
      setLoading(false);
      return;
    }

    // Filter and sort by matching interests
    const myInterests = myProfile?.interests || [];
    const sortedProfiles = (data || []).sort((a, b) => {
      const aMatch = (a.interests || []).filter((i: string) => myInterests.includes(i)).length;
      const bMatch = (b.interests || []).filter((i: string) => myInterests.includes(i)).length;
      return bMatch - aMatch;
    });

    setProfiles(sortedProfiles);
    setLoading(false);
  };

  const handleLike = async () => {
    if (!currentUserId || currentIndex >= profiles.length) return;

    const targetProfile = profiles[currentIndex];
    const success = await sendConnectionRequest(currentUserId, targetProfile.id);
    
    if (success) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handlePass = () => {
    setCurrentIndex(currentIndex + 1);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (currentIndex >= profiles.length) {
    return (
      <div className="min-h-screen bg-background">
        <DashboardNav />
        <div className="container mx-auto px-4 py-8">
          <Card className="max-w-2xl mx-auto text-center">
            <CardHeader>
              <CardTitle>That's all for now!</CardTitle>
              <CardDescription>
                Check back later for more travel buddies or explore other features
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button onClick={() => navigate("/")}>Back to Feed</Button>
              <Button variant="outline" onClick={() => navigate("/connections")}>
                View Connections
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const currentProfile = profiles[currentIndex];

  return (
    <div className="min-h-screen bg-background">
      <DashboardNav />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2">Travel Tinder</h1>
            <p className="text-muted-foreground">Find your perfect travel buddy based on shared interests</p>
          </div>

          <Card className="overflow-hidden">
            <div className="relative h-96 bg-gradient-to-br from-primary/20 to-secondary/20">
              <div className="absolute inset-0 flex items-center justify-center">
                <Avatar className="h-48 w-48 border-4 border-background">
                  <AvatarImage src={currentProfile.avatar_url || ""} />
                  <AvatarFallback className="text-4xl">
                    {currentProfile.full_name?.charAt(0) || "?"}
                  </AvatarFallback>
                </Avatar>
              </div>
            </div>

            <CardHeader>
              <CardTitle className="text-2xl">{currentProfile.full_name || "Anonymous Traveler"}</CardTitle>
              {currentProfile.home_location && (
                <CardDescription className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  {currentProfile.home_location}
                </CardDescription>
              )}
            </CardHeader>

            <CardContent className="space-y-6">
              {currentProfile.bio && (
                <div>
                  <p className="text-muted-foreground">{currentProfile.bio}</p>
                </div>
              )}

              {currentProfile.interests && currentProfile.interests.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-2 flex items-center gap-2">
                    <Heart className="h-4 w-4" />
                    Interests
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {currentProfile.interests.map((interest, idx) => (
                      <Badge key={idx} variant="secondary">
                        {interest}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {currentProfile.travel_preferences && currentProfile.travel_preferences.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-2 flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Travel Style
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {currentProfile.travel_preferences.map((pref, idx) => (
                      <Badge key={idx} variant="outline">
                        {pref}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {currentProfile.budget_range && (
                <div>
                  <h3 className="font-semibold mb-2 flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Budget Range
                  </h3>
                  <p className="text-muted-foreground">{currentProfile.budget_range}</p>
                </div>
              )}

              <div className="flex gap-4 pt-4">
                <Button
                  variant="outline"
                  size="lg"
                  className="flex-1"
                  onClick={handlePass}
                >
                  <X className="mr-2 h-5 w-5" />
                  Pass
                </Button>
                <Button
                  size="lg"
                  className="flex-1"
                  onClick={handleLike}
                >
                  <Heart className="mr-2 h-5 w-5" />
                  Connect
                </Button>
              </div>
            </CardContent>
          </Card>

          <div className="text-center mt-4 text-sm text-muted-foreground">
            {currentIndex + 1} / {profiles.length} profiles
          </div>
        </div>
      </div>
    </div>
  );
}
