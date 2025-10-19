import { useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

const Index = () => {
  const navigate = useNavigate();

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

    return () => subscription.unsubscribe();
  }, [navigate]);

  return (
    <div className="min-h-screen bg-background">
      {/* Minimalist Header */}
      <header className="border-b border-border/50">
        <div className="container mx-auto px-6 md:px-12 py-5 flex justify-between items-center max-w-7xl">
          <h1 className="text-xl font-semibold tracking-tight text-foreground">Travexa</h1>
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
      </main>

      {/* Minimal Footer */}
      <footer className="border-t border-border/50">
        <div className="container mx-auto px-6 md:px-12 py-8 max-w-7xl">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
            <p>© {new Date().getFullYear()} Travexa. All rights reserved.</p>
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
