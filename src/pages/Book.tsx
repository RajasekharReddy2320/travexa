import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Plane, Hotel, Calendar, CreditCard, QrCode } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";

export default function Book() {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("flights");
  
  const { itinerary, destination } = location.state || {};

  useEffect(() => {
    if (!itinerary) {
      toast({
        title: "No Itinerary Found",
        description: "Please generate an itinerary first.",
        variant: "destructive",
      });
      navigate('/plan-trip');
    }
  }, [itinerary, navigate, toast]);

  const handleCheckout = async () => {
    setLoading(true);
    try {
      // TODO: Integrate with Stripe for payment processing
      // This will require Stripe API key setup
      
      toast({
        title: "Booking System Setup Required",
        description: "Please add Stripe and Amadeus API keys to enable booking functionality.",
      });
    } catch (error: any) {
      console.error('Error processing checkout:', error);
      toast({
        title: "Checkout Failed",
        description: error.message || "Failed to process checkout. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!itinerary) return null;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2">Book Your Trip</h1>
            <p className="text-muted-foreground">
              Complete your booking for {destination}
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Booking Options */}
            <div className="md:col-span-2">
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="flights">
                    <Plane className="h-4 w-4 mr-2" />
                    Flights
                  </TabsTrigger>
                  <TabsTrigger value="hotels">
                    <Hotel className="h-4 w-4 mr-2" />
                    Hotels
                  </TabsTrigger>
                  <TabsTrigger value="activities">
                    <Calendar className="h-4 w-4 mr-2" />
                    Activities
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="flights" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Available Flights</CardTitle>
                      <CardDescription>
                        Select your preferred flight options
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="text-center py-12">
                        <Plane className="h-16 w-16 mx-auto mb-4 text-muted-foreground/50" />
                        <h3 className="text-lg font-semibold mb-2">Amadeus API Integration Required</h3>
                        <p className="text-muted-foreground mb-4">
                          Connect to Amadeus API to search and book flights
                        </p>
                        <Badge variant="outline">Coming Soon</Badge>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="hotels" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Available Hotels</CardTitle>
                      <CardDescription>
                        Choose your accommodation
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="text-center py-12">
                        <Hotel className="h-16 w-16 mx-auto mb-4 text-muted-foreground/50" />
                        <h3 className="text-lg font-semibold mb-2">Hotel Search Integration</h3>
                        <p className="text-muted-foreground mb-4">
                          Connect to Amadeus API to search and book hotels
                        </p>
                        <Badge variant="outline">Coming Soon</Badge>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="activities" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Activities & Experiences</CardTitle>
                      <CardDescription>
                        Book memorable experiences
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {itinerary.days?.slice(0, 3).map((day: any) => (
                          <div key={day.day} className="border rounded-lg p-4">
                            <div className="flex justify-between items-start mb-2">
                              <div>
                                <h4 className="font-semibold">Day {day.day}</h4>
                                <p className="text-sm text-muted-foreground">{day.date}</p>
                              </div>
                              <Badge>{day.activities?.length || 0} activities</Badge>
                            </div>
                            <div className="space-y-2">
                              {day.activities?.slice(0, 2).map((activity: any, idx: number) => (
                                <div key={idx} className="text-sm">
                                  <span className="font-medium">{activity.title}</span>
                                  <span className="text-muted-foreground ml-2">{activity.cost}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>

            {/* Booking Summary */}
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Booking Summary</CardTitle>
                  <CardDescription>Review your trip details</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Destination</span>
                      <span className="font-medium">{destination}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Duration</span>
                      <span className="font-medium">{itinerary.days?.length || 0} days</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Flights</span>
                      <span className="font-medium">Not selected</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Hotels</span>
                      <span className="font-medium">Not selected</span>
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <div className="flex justify-between items-center mb-4">
                      <span className="font-semibold">Estimated Total</span>
                      <span className="text-2xl font-bold">{itinerary.totalEstimatedCost}</span>
                    </div>
                    
                    <Button
                      onClick={handleCheckout}
                      disabled={loading}
                      className="w-full"
                      size="lg"
                    >
                      <CreditCard className="mr-2 h-4 w-4" />
                      {loading ? "Processing..." : "Proceed to Checkout"}
                    </Button>
                  </div>

                  <div className="text-center pt-4 border-t">
                    <QrCode className="h-12 w-12 mx-auto mb-2 text-muted-foreground/50" />
                    <p className="text-xs text-muted-foreground">
                      QR code will be generated after booking
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Setup Required</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div className="flex items-start gap-2">
                    <Badge variant="outline" className="mt-0.5">1</Badge>
                    <p className="text-muted-foreground">Add Amadeus API credentials for flight and hotel search</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <Badge variant="outline" className="mt-0.5">2</Badge>
                    <p className="text-muted-foreground">Add Stripe API key for payment processing</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <Badge variant="outline" className="mt-0.5">3</Badge>
                    <p className="text-muted-foreground">Configure email service for booking confirmations</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
