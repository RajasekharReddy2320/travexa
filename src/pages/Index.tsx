import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import ReviewSection from "@/components/ReviewSection";
import { Plane, MapPin, Calendar, Users, Heart } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();
  const [featuredTrips, setFeaturedTrips] = useState<any[]>([]);

  useEffect(() => {
    // Check if user is authenticated and redirect to dashboard
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        navigate("/dashboard");
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        navigate("/dashboard");
      }
    });

    // Fetch featured trips
    const fetchFeaturedTrips = async () => {
      const { data } = await supabase
        .from('trips')
        .select('*')
        .eq('is_public', true)
        .order('likes_count', { ascending: false })
        .limit(3);
      
      if (data) {
        setFeaturedTrips(data);
      }
    };

    fetchFeaturedTrips();

    return () => subscription.unsubscribe();
  }, [navigate]);

  return (
    <div className="min-h-screen bg-background">
      {/* Minimalist Header */}
      <header className="border-b border-border/50">
        <div className="container mx-auto px-6 md:px-12 py-5 flex justify-between items-center max-w-7xl">
          <Link to="/" className="flex items-center gap-2 group">
            <Plane className="h-6 w-6 text-accent transition-transform group-hover:rotate-12" />
            <h1 className="text-xl font-bold tracking-tight">
              Trave<span className="text-accent">X</span>a
            </h1>
          </Link>
          <div className="flex gap-4">
            <Button variant="ghost" size="sm" asChild className="text-sm">
              <Link to="/login">Login</Link>
            </Button>
            <Button size="sm" asChild className="text-sm">
              <Link to="/signup">Sign Up</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content - Editorial Style */}
      <main className="bg-background">
        {/* Hero Section */}
        <section className="container mx-auto px-6 md:px-12 max-w-4xl py-20 md:py-32">
          <h2 className="text-4xl md:text-6xl lg:text-7xl font-serif font-light text-foreground mb-8 leading-[1.1] tracking-tight text-center">
            A commitment to diminish travel-related stress.
          </h2>
          <p className="text-base md:text-lg text-muted-foreground text-center max-w-2xl mx-auto mb-10 leading-relaxed">
            Join our community of travelers who have discovered a better way to plan, connect, and explore the world with confidence.
          </p>
          <div className="flex justify-center">
            <Button size="default" asChild className="px-8">
              <Link to="/signup">Get Started</Link>
            </Button>
          </div>
        </section>

        {/* Hero Image */}
        <section className="container mx-auto px-6 md:px-12 max-w-5xl mb-20 md:mb-32">
          <div className="relative aspect-[16/10] md:aspect-[16/9] overflow-hidden rounded-lg">
            <img 
              src="/src/assets/hero-beach.jpg" 
              alt="Travel destination" 
              className="w-full h-full object-cover"
            />
          </div>
        </section>

        {/* About Section */}
        <section className="container mx-auto px-6 md:px-12 max-w-4xl mb-20 md:mb-32">
          <h3 className="text-3xl md:text-5xl font-serif font-light text-foreground mb-8 leading-tight">
            A dedication to lowering non-rail travel expenses through Wanderlust.
          </h3>
          <p className="text-base md:text-lg text-muted-foreground leading-relaxed mb-16">
            At Travexa, we believe travel should be accessible to everyone. Our AI-powered platform connects you with fellow travelers, provides intelligent trip planning, and helps you discover experiences that match your unique preferences and budget.
          </p>

          {/* Feature Grid */}
          <div className="grid md:grid-cols-3 gap-12 md:gap-8">
            <div>
              <h4 className="text-lg font-semibold text-foreground mb-3">Smart Planning</h4>
              <p className="text-sm text-muted-foreground leading-relaxed">
                AI-powered itineraries tailored to your interests, budget, and travel style.
              </p>
            </div>
            <div>
              <h4 className="text-lg font-semibold text-foreground mb-3">Social Connection</h4>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Connect with like-minded travelers, share experiences, and build memories together.
              </p>
            </div>
            <div>
              <h4 className="text-lg font-semibold text-foreground mb-3">Seamless Booking</h4>
              <p className="text-sm text-muted-foreground leading-relaxed">
                From flights to accommodations, manage your entire journey in one place.
              </p>
            </div>
          </div>
        </section>

        {/* Quote Section - Dark Background */}
        <section className="bg-foreground text-background py-20 md:py-32 mb-20 md:mb-32">
          <div className="container mx-auto px-6 md:px-12 max-w-3xl">
            <blockquote className="text-2xl md:text-3xl lg:text-4xl font-serif font-light italic leading-relaxed text-center mb-8">
              "I believe travel should feel like freedom, not stress, and that's why I created Travexa—to give people a simple, connected, and joyful way to explore the world."
            </blockquote>
            <p className="text-center text-background/70 text-sm tracking-wide">
              — FOUNDER, TRAVEXA
            </p>
          </div>
        </section>

        {/* Featured Trips Section */}
        <section className="container mx-auto px-6 md:px-12 max-w-6xl mb-20 md:mb-32">
          <div className="text-center mb-12">
            <h3 className="text-3xl md:text-4xl font-serif font-light text-foreground mb-4">
              Popular Trips
            </h3>
            <p className="text-base text-muted-foreground">
              Discover amazing journeys planned by our community
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {featuredTrips.map((trip) => (
              <Card key={trip.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                {trip.image_url && (
                  <div className="aspect-video overflow-hidden">
                    <img 
                      src={trip.image_url} 
                      alt={trip.title}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                )}
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-lg">{trip.title}</CardTitle>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Heart className="h-4 w-4" />
                      <span>{trip.likes_count}</span>
                    </div>
                  </div>
                  <CardDescription className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    {trip.destination}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {trip.planner_mode && (
                      <Badge variant="secondary" className="text-xs">
                        {trip.planner_mode}
                      </Badge>
                    )}
                    {trip.interests?.slice(0, 2).map((interest: string) => (
                      <Badge key={interest} variant="outline" className="text-xs">
                        {interest}
                      </Badge>
                    ))}
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {Math.ceil((new Date(trip.end_date).getTime() - new Date(trip.start_date).getTime()) / (1000 * 60 * 60 * 24))} days
                    </div>
                    {trip.group_size && (
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        {trip.group_size} {trip.group_size === 1 ? 'person' : 'people'}
                      </div>
                    )}
                  </div>
                  {trip.notes && (
                    <p className="text-xs text-muted-foreground mt-3 line-clamp-2">
                      {trip.notes}
                    </p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center mt-8">
            <Button variant="outline" asChild>
              <Link to="/signup">Explore More Trips</Link>
            </Button>
          </div>
        </section>

        {/* Mission Statement */}
        <section className="container mx-auto px-6 md:px-12 max-w-4xl mb-20 md:mb-32 text-center">
          <h3 className="text-3xl md:text-5xl font-serif font-light text-foreground mb-6">
            Woah. Read. Listen
          </h3>
          <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Every journey becomes an opportunity. Every connection becomes a friendship. Every experience becomes a cherished memory.
          </p>
        </section>

        {/* Final CTA */}
        <section className="container mx-auto px-6 md:px-12 max-w-4xl pb-20 md:pb-32 text-center">
          <h3 className="text-3xl md:text-4xl font-serif font-light text-foreground mb-4">
            Join 900+ subscribers
          </h3>
          <p className="text-base text-muted-foreground mb-8">
            Start today and experience the joy of hassle-free travel.
          </p>
          <Button size="default" asChild className="px-8">
            <Link to="/signup">Sign Up</Link>
          </Button>
        </section>

        {/* Review Section */}
        <ReviewSection />
      </main>

      {/* Minimal Footer */}
      <footer className="border-t border-border/50">
        <div className="container mx-auto px-6 md:px-12 py-8 max-w-7xl">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
            <div>
              <p>© {new Date().getFullYear()} Travexa. All rights reserved.</p>
              <p className="text-xs mt-1">Made with ❤️ by Rajasekhar</p>
            </div>
            <div className="flex gap-8">
              <Link to="/login" className="hover:text-foreground transition-colors">Login</Link>
              <Link to="/signup" className="hover:text-foreground transition-colors">Sign Up</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
