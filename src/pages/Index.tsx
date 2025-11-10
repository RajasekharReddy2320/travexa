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
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card/50 backdrop-blur-sm border-b border-border sticky top-0 z-50">
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
              <div className="absolute inset-0 bg-primary/20 rounded-full blur-3xl"></div>
              <div className="relative">
                <Plane className="h-24 w-24 text-primary" />
              </div>
            </div>
          </div>

          <div className="mb-6">
            <Badge variant="secondary" className="mb-4">
              Welcome to Travexa
            </Badge>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              Your <span className="text-primary">AI-Powered</span> Travel Companion
            </h1>
          </div>

          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
            Plan trips with AI assistance, connect with fellow travelers, and manage all your bookings in one place.
          </p>

          <Button size="lg" asChild className="px-8">
            <Link to="/signup">Get Started Free</Link>
          </Button>
        </section>

        {/* Features Grid */}
        <section className="container mx-auto px-6 py-16 max-w-6xl">
          <div className="grid md:grid-cols-3 gap-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="text-2xl">🤖</span>
                  AI Trip Planning
                </CardTitle>
                <CardDescription>
                  Get personalized itineraries powered by advanced AI
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="text-2xl">👥</span>
                  Social Features
                </CardTitle>
                <CardDescription>
                  Connect with travelers and share experiences
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="text-2xl">🎫</span>
                  Easy Booking
                </CardTitle>
                <CardDescription>
                  Book flights, trains, and buses all in one place
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </section>

        {/* Featured Trips */}
        <FeaturedTrips />

        {/* Feedback Section */}
        <section className="container mx-auto px-6 py-20 max-w-4xl">
          <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
            <CardHeader className="text-center">
              <CardTitle className="text-3xl mb-4">We'd Love Your Feedback!</CardTitle>
              <CardDescription className="text-base">
                Travexa is currently in development. We're building a fully functional travel planning and booking platform.
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <p className="text-lg font-medium text-foreground">
                Would you use Travexa if it were fully functional?
              </p>
              <p className="text-muted-foreground">
                Your feedback helps us understand what travelers need most. We're working hard to bring you features like AI-powered trip planning, social connections with fellow travelers, and seamless booking experiences.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                <Button size="lg" className="px-8">
                  <Link to="/signup">Yes, Sign Me Up!</Link>
                </Button>
                <Button size="lg" variant="outline" className="px-8" asChild>
                  <Link to="/signup">Maybe, Tell Me More</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* CTA Section */}
        <section className="container mx-auto px-6 py-20 max-w-4xl text-center">
          <h3 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Join 900+ travelers today
          </h3>
          <p className="text-lg text-muted-foreground mb-8">
            Start planning your next adventure with AI-powered assistance.
          </p>
          <Button size="lg" asChild className="px-8">
            <Link to="/signup">Create Free Account</Link>
          </Button>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-card/50 backdrop-blur-sm">
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
