import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { User, Mail, Phone, MapPin, Globe, Calendar, LogOut } from "lucide-react";
import DashboardNav from "@/components/DashboardNav";
import { Badge } from "@/components/ui/badge";

interface Profile {
  id: string;
  full_name: string | null;
  email: string;
  phone: string | null;
  bio: string | null;
  age: number | null;
  gender: string | null;
  date_of_birth: string | null;
  country: string | null;
  state: string | null;
  home_location: string | null;
  languages_spoken: string[] | null;
  interests: string[] | null;
  travel_preferences: string[] | null;
  avatar_url: string | null;
}

const Profile = () => {
  const navigate = useNavigate();
  const { userId } = useParams();
  const { toast } = useToast();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isOwnProfile, setIsOwnProfile] = useState(true);
  const [likedTrips, setLikedTrips] = useState<any[]>([]);
  const [bucketList, setBucketList] = useState<any[]>([]);
  const [userTrips, setUserTrips] = useState<any[]>([]);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      navigate("/login");
      return;
    }

    const targetUserId = userId || session.user.id;
    setIsOwnProfile(!userId || userId === session.user.id);
    await loadProfile(targetUserId);
    await loadUserActivity(targetUserId);
  };

  const loadProfile = async (targetUserId: string) => {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", targetUserId)
      .maybeSingle();

    if (error) {
      toast({
        title: "Error",
        description: "Failed to load profile",
        variant: "destructive"
      });
      setLoading(false);
      return;
    }

    // If profile doesn't exist, create one
    if (!data && isOwnProfile) {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        const newProfile = {
          id: user.id,
          email: user.email || "",
          full_name: user.user_metadata?.full_name || "",
          phone: null,
          bio: null,
          age: null,
          gender: null,
          date_of_birth: null,
          country: null,
          state: null,
          home_location: null,
          languages_spoken: [],
          interests: [],
          travel_preferences: [],
          avatar_url: null
        };

        const { error: insertError } = await supabase
          .from("profiles")
          .insert(newProfile);

        if (insertError) {
          toast({
            title: "Error",
            description: "Failed to create profile",
            variant: "destructive"
          });
        } else {
          setProfile(newProfile);
          toast({
            title: "Welcome!",
            description: "Your profile has been created. Please complete your details."
          });
          setEditing(true);
        }
      }
    } else {
      setProfile(data);
    }

    setLoading(false);
  };

  const loadUserActivity = async (targetUserId: string) => {
    // Load liked trips
    const { data: likes } = await supabase
      .from("trip_likes")
      .select(`
        trip_id,
        trips:trip_id (*)
      `)
      .eq("user_id", targetUserId);

    if (likes) {
      setLikedTrips(likes.map(l => l.trips).filter(Boolean));
    }

    // Load bucket list
    const { data: bucket } = await supabase
      .from("bucket_list")
      .select(`
        trip_id,
        trips:trip_id (*)
      `)
      .eq("user_id", targetUserId);

    if (bucket) {
      setBucketList(bucket.map(b => b.trips).filter(Boolean));
    }

    // Load user's trips
    const { data: trips } = await supabase
      .from("trips")
      .select("*")
      .eq("user_id", targetUserId)
      .order("created_at", { ascending: false });

    if (trips) {
      setUserTrips(trips);
    }
  };

  const handleSave = async () => {
    if (!profile) return;

    const { error } = await supabase
      .from("profiles")
      .update({
        full_name: profile.full_name,
        phone: profile.phone,
        bio: profile.bio,
        age: profile.age,
        gender: profile.gender,
        date_of_birth: profile.date_of_birth,
        country: profile.country,
        state: profile.state,
        home_location: profile.home_location,
        languages_spoken: profile.languages_spoken,
        interests: profile.interests,
        travel_preferences: profile.travel_preferences,
      })
      .eq("id", profile.id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "Success",
      description: "Profile updated successfully"
    });
    
    setEditing(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/login");
  };

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
          <User className="h-12 w-12 mx-auto mb-4 text-primary animate-bounce" />
          <p className="text-muted-foreground">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!profile) return null;

  return (
    <div className="min-h-screen bg-background">
      <DashboardNav />

      <main className="container px-4 py-8 max-w-4xl">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">{isOwnProfile ? "My Profile" : "Profile"}</h1>
          {isOwnProfile && (
            <Button variant="outline" onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          )}
        </div>

        {/* Profile Header */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex items-center gap-6">
              <Avatar className="h-24 w-24">
                <AvatarImage src={profile.avatar_url || undefined} />
                <AvatarFallback className="text-2xl">{getInitials(profile.full_name)}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h2 className="text-2xl font-bold mb-1">{profile.full_name || "User"}</h2>
                <div className="flex items-center gap-2 text-muted-foreground mb-2">
                  <Mail className="h-4 w-4" />
                  {profile.email}
                </div>
                {profile.phone && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Phone className="h-4 w-4" />
                    {profile.phone}
                  </div>
                )}
              </div>
              {isOwnProfile && (
                <Button onClick={() => setEditing(!editing)}>
                  {editing ? "Cancel" : "Edit Profile"}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Profile Details */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
            <CardDescription>Your personal details and preferences</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="full_name">Full Name</Label>
              <Input
                id="full_name"
                value={profile.full_name || ""}
                onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                disabled={!editing}
              />
            </div>

            <div>
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                value={profile.phone || ""}
                onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                disabled={!editing}
                placeholder="Add phone number"
              />
            </div>

            <div>
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                value={profile.bio || ""}
                onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                disabled={!editing}
                placeholder="Tell us about yourself"
                rows={4}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="age">Age</Label>
                <Input
                  id="age"
                  type="number"
                  value={profile.age || ""}
                  onChange={(e) => setProfile({ ...profile, age: parseInt(e.target.value) || null })}
                  disabled={!editing}
                  placeholder="Add age"
                />
              </div>

              <div>
                <Label htmlFor="gender">Gender</Label>
                <Input
                  id="gender"
                  value={profile.gender || ""}
                  onChange={(e) => setProfile({ ...profile, gender: e.target.value })}
                  disabled={!editing}
                  placeholder="Add gender"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="dob">Date of Birth</Label>
              <Input
                id="dob"
                type="date"
                value={profile.date_of_birth || ""}
                onChange={(e) => setProfile({ ...profile, date_of_birth: e.target.value })}
                disabled={!editing}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="country">Country</Label>
                <Input
                  id="country"
                  value={profile.country || ""}
                  onChange={(e) => setProfile({ ...profile, country: e.target.value })}
                  disabled={!editing}
                  placeholder="Add country"
                />
              </div>

              <div>
                <Label htmlFor="state">State</Label>
                <Input
                  id="state"
                  value={profile.state || ""}
                  onChange={(e) => setProfile({ ...profile, state: e.target.value })}
                  disabled={!editing}
                  placeholder="Add state"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="home_location">Home Location</Label>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <Input
                  id="home_location"
                  value={profile.home_location || ""}
                  onChange={(e) => setProfile({ ...profile, home_location: e.target.value })}
                  disabled={!editing}
                  placeholder="Add home location"
                  className="flex-1"
                />
              </div>
            </div>

            {editing && (
              <div className="pt-4">
                <Button onClick={handleSave} className="w-full">
                  Save Changes
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Languages */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              Languages Spoken
            </CardTitle>
          </CardHeader>
          <CardContent>
            {profile.languages_spoken && profile.languages_spoken.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {profile.languages_spoken.map((lang) => (
                  <Badge key={lang} variant="secondary">{lang}</Badge>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-sm">No languages added yet</p>
            )}
          </CardContent>
        </Card>

        {/* Interests */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Travel Interests</CardTitle>
          </CardHeader>
          <CardContent>
            {profile.interests && profile.interests.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {profile.interests.map((interest) => (
                  <Badge key={interest} variant="outline">{interest}</Badge>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-sm">No interests added yet</p>
            )}
          </CardContent>
        </Card>

        {/* Travel Preferences */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Travel Preferences</CardTitle>
          </CardHeader>
          <CardContent>
            {profile.travel_preferences && profile.travel_preferences.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {profile.travel_preferences.map((pref) => (
                  <Badge key={pref}>{pref}</Badge>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-sm">No preferences added yet</p>
            )}
          </CardContent>
        </Card>

        {/* Activity Section */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Your Activity</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">Liked Trips ({likedTrips.length})</h3>
              {likedTrips.length > 0 ? (
                <div className="grid grid-cols-2 gap-2">
                  {likedTrips.slice(0, 4).map((trip: any) => (
                    <Card key={trip.id} className="p-3">
                      <p className="font-medium text-sm truncate">{trip.title}</p>
                      <p className="text-xs text-muted-foreground truncate">{trip.destination}</p>
                    </Card>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No liked trips yet</p>
              )}
            </div>

            <div>
              <h3 className="font-semibold mb-2">Bucket List ({bucketList.length})</h3>
              {bucketList.length > 0 ? (
                <div className="grid grid-cols-2 gap-2">
                  {bucketList.slice(0, 4).map((trip: any) => (
                    <Card key={trip.id} className="p-3">
                      <p className="font-medium text-sm truncate">{trip.title}</p>
                      <p className="text-xs text-muted-foreground truncate">{trip.destination}</p>
                    </Card>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No saved trips yet</p>
              )}
            </div>

            <div>
              <h3 className="font-semibold mb-2">Your Trips ({userTrips.length})</h3>
              {userTrips.length > 0 ? (
                <div className="grid grid-cols-2 gap-2">
                  {userTrips.slice(0, 4).map((trip: any) => (
                    <Card key={trip.id} className="p-3">
                      <p className="font-medium text-sm truncate">{trip.title}</p>
                      <p className="text-xs text-muted-foreground truncate">{trip.destination}</p>
                      <Badge variant={trip.is_public ? "default" : "secondary"} className="text-xs mt-1">
                        {trip.is_public ? "Public" : "Private"}
                      </Badge>
                    </Card>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No trips created yet</p>
              )}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Profile;