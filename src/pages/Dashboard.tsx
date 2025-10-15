import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { 
  Plane, 
  Calendar, 
  Cloud, 
  Sparkles, 
  MapPin, 
  TrendingUp,
  LogOut,
  Menu
} from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

interface Profile {
  full_name: string | null;
  email: string;
  interests: string[] | null;
  budget_range: string | null;
  avatar_url: string | null;
}

const Dashboard = () => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      navigate('/login');
      return;
    }

    await loadProfile(session.user.id);
  };

  const loadProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;

      if (!data.onboarding_completed) {
        navigate('/onboarding');
        return;
      }

      setProfile(data);
    } catch (error: any) {
      toast({
        title: 'Error loading profile',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  const getInitials = (name: string | null) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const NavContent = () => (
    <nav className="space-y-1">
      <Button variant="ghost" className="w-full justify-start">
        <MapPin className="mr-2 h-4 w-4" />
        Discover
      </Button>
      <Button variant="ghost" className="w-full justify-start">
        <Calendar className="mr-2 h-4 w-4" />
        My Trips
      </Button>
      <Button variant="ghost" className="w-full justify-start">
        <Sparkles className="mr-2 h-4 w-4" />
        AI Planner
      </Button>
      <Button variant="ghost" className="w-full justify-start">
        <TrendingUp className="mr-2 h-4 w-4" />
        Trending
      </Button>
    </nav>
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Plane className="h-8 w-8 animate-pulse text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Top Navigation */}
      <header className="border-b sticky top-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-10">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-64">
                <div className="py-4">
                  <h2 className="font-bold text-lg mb-4 flex items-center gap-2">
                    <Plane className="h-5 w-5 text-primary" />
                    Travexa
                  </h2>
                  <NavContent />
                </div>
              </SheetContent>
            </Sheet>
            
            <h1 className="text-xl font-bold flex items-center gap-2">
              <Plane className="h-6 w-6 text-primary" />
              <span className="hidden sm:inline">Travexa</span>
            </h1>
          </div>
          
          <div className="flex items-center gap-4">
            <Avatar className="cursor-pointer" onClick={() => navigate('/profile')}>
              <AvatarImage src={profile?.avatar_url || undefined} />
              <AvatarFallback className="bg-primary/10 text-primary">
                {getInitials(profile?.full_name)}
              </AvatarFallback>
            </Avatar>
            <Button variant="ghost" size="icon" onClick={handleLogout}>
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="flex gap-6">
          {/* Sidebar - Desktop */}
          <aside className="hidden md:block w-64 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Navigation</CardTitle>
              </CardHeader>
              <CardContent>
                <NavContent />
              </CardContent>
            </Card>
          </aside>

          {/* Main Content */}
          <main className="flex-1 space-y-6">
            {/* Welcome Card */}
            <Card className="bg-gradient-to-br from-primary/10 to-accent/10 border-none">
              <CardContent className="pt-6">
                <h2 className="text-2xl font-bold mb-2">
                  Welcome back, {profile?.full_name?.split(' ')[0] || 'Traveler'}!
                </h2>
                <p className="text-muted-foreground">
                  Ready for your next adventure?
                </p>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <div className="grid gap-4 md:grid-cols-3">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Upcoming Trips</CardTitle>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">0</div>
                  <p className="text-xs text-muted-foreground">No trips planned yet</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Weather</CardTitle>
                  <Cloud className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">72°F</div>
                  <p className="text-xs text-muted-foreground">Perfect travel weather</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">AI Recommendations</CardTitle>
                  <Sparkles className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">12</div>
                  <p className="text-xs text-muted-foreground">Personalized for you</p>
                </CardContent>
              </Card>
            </div>

            {/* Your Interests */}
            {profile?.interests && profile.interests.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Your Interests</CardTitle>
                  <CardDescription>
                    Destinations matching your preferences
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {profile.interests.map((interest) => (
                      <Badge key={interest} variant="secondary">
                        {interest}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* AI Planner CTA */}
            <Card className="bg-gradient-to-br from-secondary/10 to-primary/10 border-none">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5" />
                  AI Travel Planner
                </CardTitle>
                <CardDescription>
                  Let AI create a personalized itinerary based on your preferences
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full sm:w-auto">
                  Start Planning
                </Button>
              </CardContent>
            </Card>
          </main>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
