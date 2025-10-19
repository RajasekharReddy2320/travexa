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
      {/* Simple Header - Only Login/Signup */}
      <header className="border-b border-border">
        <div className="container mx-auto px-4 py-6 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-foreground">Travexa</h1>
          <div className="flex gap-3">
            <Button variant="ghost" asChild>
              <Link to="/login">Login</Link>
            </Button>
            <Button asChild>
              <Link to="/signup">Sign Up</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-16 max-w-4xl">
        {/* Hero Section */}
        <section className="text-center mb-20">
          <h2 className="text-4xl md:text-6xl font-bold text-foreground mb-6 leading-tight">
            A commitment to diminish travel-related stress.
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join our community of travelers who have discovered a better way to plan, 
            connect, and explore the world with confidence.
          </p>
          <Button size="lg" asChild className="text-lg">
            <Link to="/signup">Get Started</Link>
          </Button>
        </section>

        <Separator className="my-16" />

        {/* About Section */}
        <section className="mb-20">
          <h3 className="text-3xl md:text-5xl font-bold text-foreground mb-8 leading-tight">
            A dedication to lowering non-rail travel expenses through Wanderlust.
          </h3>
          <p className="text-lg text-muted-foreground leading-relaxed mb-12">
            At Travexa, we believe travel should be accessible to everyone. Our AI-powered 
            platform connects you with fellow travelers, provides intelligent trip planning, 
            and helps you discover experiences that match your unique preferences and budget.
          </p>

          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <div>
              <h4 className="text-xl font-bold text-foreground mb-3">Smart Planning</h4>
              <p className="text-muted-foreground">
                AI-powered itineraries tailored to your interests, budget, and travel style.
              </p>
            </div>
            <div>
              <h4 className="text-xl font-bold text-foreground mb-3">Social Connection</h4>
              <p className="text-muted-foreground">
                Connect with like-minded travelers, share experiences, and build memories together.
              </p>
            </div>
            <div>
              <h4 className="text-xl font-bold text-foreground mb-3">Seamless Booking</h4>
              <p className="text-muted-foreground">
                From flights to accommodations, manage your entire journey in one place.
              </p>
            </div>
          </div>
        </section>

        <Separator className="my-16" />

        {/* Quote Section */}
        <section className="bg-accent/5 rounded-lg p-12 mb-20">
          <blockquote className="text-2xl md:text-3xl font-serif italic text-foreground text-center leading-relaxed">
            "I believe travel should feel like freedom, not stress, and that's why I created 
            Travexa—to give people a simple, connected, and joyful way to explore the world."
          </blockquote>
          <p className="text-center text-muted-foreground mt-6 text-lg">
            — Founder, Travexa
          </p>
        </section>

        {/* Mission Statement */}
        <section className="text-center mb-20">
          <h3 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
            Woah. Read. Listen
          </h3>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
            Every journey becomes an opportunity. Every connection becomes a friendship. 
            Every experience becomes a cherished memory.
          </p>
        </section>

        <Separator className="my-16" />

        {/* Final CTA */}
        <section className="text-center">
          <h3 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Join 900+ subscribers
          </h3>
          <p className="text-lg text-muted-foreground mb-8">
            Start today and experience the joy of hassle-free travel.
          </p>
          <Button size="lg" asChild className="text-lg">
            <Link to="/signup">Sign Up</Link>
          </Button>
        </section>
      </main>

      {/* Simple Footer */}
      <footer className="border-t border-border mt-20">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} Travexa. All rights reserved.
            </p>
            <div className="flex gap-6">
              <Link to="/login" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Login
              </Link>
              <Link to="/signup" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Sign Up
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
