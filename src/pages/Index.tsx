import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

import FeaturedTrips from "@/components/FeaturedTrips";
import { Plane } from "lucide-react";

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
    <div className="min-h-screen bg-gradient-to-b from-purple-50 via-blue-50 to-white dark:from-purple-950/20 dark:via-blue-950/20 dark:to-background">
      {/* Header */}
      <header className="bg-white/80 dark:bg-background/80 backdrop-blur-sm border-b border-border/50 sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center max-w-6xl">
          <Link to="/" className="flex items-center gap-2 group">
            <Plane className="h-6 w-6 text-primary transition-transform group-hover:rotate-12" />
            <h1 className="text-xl font-bold tracking-tight">
              Trave<span className="text-primary">X</span>a
            </h1>
          </Link>
          <div className="flex gap-3">
            <Button variant="ghost" size="sm" asChild>
              <Link to="/login">Login</Link>
            </Button>
            <Button size="sm" asChild>
              <Link to="/signup">Sign Up</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main>
        {/* Hero Section */}
        <section className="container mx-auto px-6 py-16 md:py-24 max-w-4xl text-center">
          <div className="mb-8 flex justify-center">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-blue-400 rounded-3xl blur-2xl opacity-30"></div>
              <div className="relative bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 rounded-3xl p-12 backdrop-blur-sm">
                <Plane className="h-24 w-24 text-primary mx-auto" />
              </div>
            </div>
          </div>

          <div className="mb-6">
            <Badge variant="secondary" className="mb-4">
              Welcome to Travexa
            </Badge>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              <span className="text-primary">Simplify</span> your travel planning
            </h1>
          </div>

          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
            Discover seamless travel experiences with AI-powered trip planning, connect with fellow travelers, and explore the world with confidence.
          </p>

          <Button size="lg" asChild className="px-8">
            <Link to="/signup">Get Started</Link>
          </Button>
        </section>

        {/* Feature Section 1 - Plan */}
        <section className="container mx-auto px-6 py-16 max-w-5xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Travexa <span className="text-purple-500">Plan</span>
            </h2>
            <p className="text-muted-foreground">✨ Your way, your discovery</p>
          </div>

          <div className="flex justify-center gap-2 mb-8">
            <div className="w-2 h-2 rounded-full bg-purple-500"></div>
            <div className="w-2 h-2 rounded-full bg-muted"></div>
            <div className="w-2 h-2 rounded-full bg-muted"></div>
          </div>

          <div className="bg-white dark:bg-card rounded-2xl p-8 shadow-lg border border-border/50">
            <h3 className="text-xl font-semibold mb-4 text-center">
              Smart Planning with AI-Powered Suggestions
            </h3>
            <div className="aspect-video bg-gradient-to-br from-purple-100 to-blue-100 dark:from-purple-900/30 dark:to-blue-900/30 rounded-xl flex items-center justify-center">
              <img 
                src="/src/assets/hero-beach.jpg" 
                alt="Smart Planning" 
                className="w-full h-full object-cover rounded-xl"
              />
            </div>
          </div>
        </section>

        {/* Feature Section 2 - Connect */}
        <section className="container mx-auto px-6 py-16 max-w-5xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Travexa <span className="text-teal-500">Connect</span>
            </h2>
            <p className="text-muted-foreground">📱 Meet fellow travelers</p>
          </div>

          <div className="flex justify-center gap-2 mb-8">
            <div className="w-2 h-2 rounded-full bg-muted"></div>
            <div className="w-2 h-2 rounded-full bg-teal-500"></div>
            <div className="w-2 h-2 rounded-full bg-muted"></div>
          </div>

          <div className="bg-white dark:bg-card rounded-2xl p-8 shadow-lg border border-border/50">
            <h3 className="text-xl font-semibold mb-4 text-center">
              Social Connection for Better Experiences
            </h3>
            <div className="aspect-video bg-gradient-to-br from-teal-100 to-green-100 dark:from-teal-900/30 dark:to-green-900/30 rounded-xl flex items-center justify-center">
              <img 
                src="/src/assets/destination-city.jpg" 
                alt="Social Connection" 
                className="w-full h-full object-cover rounded-xl"
              />
            </div>
          </div>
        </section>

        {/* Feature Section 3 - Book */}
        <section className="container mx-auto px-6 py-16 max-w-5xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Travexa <span className="text-orange-500">Book</span>
            </h2>
            <p className="text-muted-foreground">📂 Save and organize your journey</p>
          </div>

          <div className="flex justify-center gap-2 mb-8">
            <div className="w-2 h-2 rounded-full bg-muted"></div>
            <div className="w-2 h-2 rounded-full bg-muted"></div>
            <div className="w-2 h-2 rounded-full bg-orange-500"></div>
          </div>

          <div className="bg-white dark:bg-card rounded-2xl p-8 shadow-lg border border-border/50">
            <h3 className="text-xl font-semibold mb-4 text-center">
              Seamless Booking & Management
            </h3>
            <div className="aspect-video bg-gradient-to-br from-orange-100 to-red-100 dark:from-orange-900/30 dark:to-red-900/30 rounded-xl flex items-center justify-center">
              <img 
                src="/src/assets/destination-mountains.jpg" 
                alt="Seamless Booking" 
                className="w-full h-full object-cover rounded-xl"
              />
            </div>
          </div>
        </section>

        {/* Featured Trips */}
        <FeaturedTrips />

        {/* CTA Section */}
        <section className="container mx-auto px-6 py-20 max-w-4xl text-center">
          <h3 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Join 900+ travelers
          </h3>
          <p className="text-lg text-muted-foreground mb-8">
            Start today and experience the joy of hassle-free travel.
          </p>
          <Button size="lg" asChild className="px-8">
            <Link to="/signup">Sign Up Free</Link>
          </Button>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/50 bg-white/50 dark:bg-background/50 backdrop-blur-sm">
        <div className="container mx-auto px-6 py-8 max-w-6xl">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
            <div className="text-center md:text-left">
              <p>© {new Date().getFullYear()} Travexa. All rights reserved.</p>
              <p className="text-xs mt-1">Made with ❤️ by Rajasekhar</p>
            </div>
            <div className="flex gap-6">
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
