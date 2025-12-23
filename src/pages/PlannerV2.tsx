import React, { useState } from 'react';
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import DashboardNav from "@/components/DashboardNav";
import InputForm from "@/components/planner/InputForm";
import ItineraryCard from "@/components/planner/ItineraryCard";
import ItineraryMap from "@/components/planner/ItineraryMap";
import PlannerCart from "@/components/planner/PlannerCart";
import { TripParams, TripResponse, ItineraryStep, CartItem } from "@/types/tripPlanner";
import { supabase } from "@/integrations/supabase/client";
import { Map, AlertCircle, Sparkles, PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

const PlannerV2 = () => {
  const [tripData, setTripData] = useState<TripResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const { toast } = useToast();

  const handlePlanTrip = async (params: TripParams) => {
    setIsLoading(true);
    setError(null);
    setTripData(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke('generate-trip-plan', {
        body: params
      });

      if (fnError) {
        throw new Error(fnError.message);
      }

      if (data.error) {
        throw new Error(data.error);
      }

      setTripData(data);
      toast({
        title: "Trip Generated!",
        description: `Your ${params.destination} itinerary is ready.`,
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to generate trip plan";
      setError(message);
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddToCart = (step: ItineraryStep) => {
    if (!cartItems.some(item => item.id === step.id)) {
      setCartItems(prev => [...prev, { ...step, addedAt: Date.now() }]);
      setIsCartOpen(true);
      toast({
        title: "Added to Cart",
        description: step.title,
      });
    }
  };

  const handleAddAll = () => {
    if (!tripData) return;
    const newItems = tripData.steps
      .filter(step => step.isBookable && !cartItems.some(item => item.id === step.id))
      .map(step => ({ ...step, addedAt: Date.now() }));
    if (newItems.length > 0) {
      setCartItems(prev => [...prev, ...newItems]);
      setIsCartOpen(true);
      toast({
        title: "Added All Bookable Items",
        description: `${newItems.length} items added to cart`,
      });
    }
  };

  const handleRemoveFromCart = (id: string) => {
    setCartItems(prev => prev.filter(item => item.id !== id));
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        <div className="flex-1 flex flex-col">
          <DashboardNav />
          
          <main className="flex-1 pb-20">
            {/* Header */}
            <header className="bg-card border-b border-border sticky top-0 z-40">
              <div className="max-w-5xl mx-auto px-6 py-4 flex items-center gap-2">
                <div className="bg-primary text-primary-foreground p-2 rounded-lg">
                  <Map size={20} />
                </div>
                <h1 className="text-xl font-bold tracking-tight">WanderPlan AI</h1>
              </div>
            </header>

            <div className="max-w-5xl mx-auto px-6 py-10">
              {/* Intro Text */}
              {!tripData && !isLoading && (
                <div className="text-center mb-10 space-y-4 max-w-2xl mx-auto">
                  <h2 className="text-4xl md:text-5xl font-extrabold text-foreground tracking-tight">
                    Where do you want to{' '}
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary/60">
                      go?
                    </span>
                  </h2>
                  <p className="text-lg text-muted-foreground">
                    Enter your details below and let our AI curate a perfect, bookable itinerary just for you.
                  </p>
                </div>
              )}

              {/* Input Form */}
              <InputForm onSubmit={handlePlanTrip} isLoading={isLoading} />

              {/* Error State */}
              {error && (
                <div className="bg-destructive/10 border border-destructive/20 text-destructive p-4 rounded-2xl flex items-center gap-3 max-w-2xl mx-auto mb-8 animate-fade-in">
                  <AlertCircle size={24} />
                  <p>{error}</p>
                </div>
              )}

              {/* Results Area */}
              {tripData && (
                <div className="animate-fade-in">
                  {/* Trip Header */}
                  <div className="text-center mb-8">
                    <div className="inline-flex items-center gap-2 bg-secondary text-secondary-foreground px-4 py-1.5 rounded-full text-sm font-bold mb-4">
                      <Sparkles size={14} />
                      {tripData.reason}
                    </div>
                    <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
                      {tripData.title}
                    </h2>
                    <p className="text-muted-foreground mb-6">Here is your curated itinerary</p>
                    
                    {/* Add All Button */}
                    <Button
                      onClick={handleAddAll}
                      variant="secondary"
                      className="inline-flex items-center gap-2"
                    >
                      <PlusCircle size={16} />
                      Add All Bookable Items
                    </Button>
                  </div>

                  {/* Interactive Map */}
                  <ItineraryMap steps={tripData.steps} />

                  {/* Timeline Connector Line (Visual) */}
                  <div className="relative">
                    <div className="absolute left-[50%] top-0 bottom-0 w-px bg-border hidden md:block -z-10 transform -translate-x-1/2"></div>
                    
                    {/* Steps */}
                    <div className="space-y-6 relative z-10">
                      {tripData.steps.map((step) => (
                        <ItineraryCard
                          key={step.id}
                          step={step}
                          onAdd={handleAddToCart}
                          isAdded={cartItems.some(item => item.id === step.id)}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Completion Message */}
                  <div className="text-center mt-16 pb-10">
                    <p className="text-muted-foreground text-sm">End of Itinerary</p>
                    <div className="w-2 h-2 bg-muted-foreground/50 rounded-full mx-auto mt-2"></div>
                  </div>
                </div>
              )}
            </div>
          </main>

          {/* Cart Component */}
          <PlannerCart
            items={cartItems}
            onRemove={handleRemoveFromCart}
            isOpen={isCartOpen}
            setIsOpen={setIsCartOpen}
          />
        </div>
      </div>
    </SidebarProvider>
  );
};

export default PlannerV2;
