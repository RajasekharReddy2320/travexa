import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Plane, Hotel, Calendar, CreditCard, QrCode, Train, Bus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";

interface BookingSelection {
  type: 'flight' | 'train' | 'bus' | 'hotel';
  data: any;
}

export default function Book() {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("flights");
  const [flights, setFlights] = useState<any[]>([]);
  const [trains, setTrains] = useState<any[]>([]);
  const [buses, setBuses] = useState<any[]>([]);
  const [hotels, setHotels] = useState<any[]>([]);
  const [selectedBookings, setSelectedBookings] = useState<BookingSelection[]>([]);
  const [passengerName, setPassengerName] = useState("");
  const [passengerEmail, setPassengerEmail] = useState("");
  const [passengerPhone, setPassengerPhone] = useState("");
  const [showPayment, setShowPayment] = useState(false);
  
  const { itinerary, destination } = location.state || {};

  useEffect(() => {
    if (!itinerary) {
      toast({
        title: "No Itinerary Found",
        description: "Please generate an itinerary first.",
        variant: "destructive",
      });
      navigate('/plan-trip');
    } else {
      loadTransportOptions();
    }
  }, [itinerary, navigate, toast]);

  const loadTransportOptions = async () => {
    const fromLocation = "Your Location";
    const toLocation = destination || "Destination";
    const date = itinerary.days?.[0]?.date || new Date().toISOString().split('T')[0];

    // Load flights
    const { data: flightData } = await supabase.functions.invoke('search-flights', {
      body: { from: fromLocation, to: toLocation, date }
    });
    if (flightData?.flights) setFlights(flightData.flights.slice(0, 3));

    // Load trains
    const { data: trainData } = await supabase.functions.invoke('search-trains', {
      body: { from: fromLocation, to: toLocation, date }
    });
    if (trainData?.trains) setTrains(trainData.trains.slice(0, 3));

    // Load buses
    const { data: busData } = await supabase.functions.invoke('search-buses', {
      body: { from: fromLocation, to: toLocation, date }
    });
    if (busData?.buses) setBuses(busData.buses.slice(0, 3));

    // Generate mock hotels
    setHotels([
      {
        id: '1',
        name: 'Luxury Grand Hotel',
        rating: 5,
        price: 5500,
        amenities: ['WiFi', 'Pool', 'Spa', 'Restaurant'],
        location: destination
      },
      {
        id: '2',
        name: 'Comfort Inn & Suites',
        rating: 4,
        price: 3200,
        amenities: ['WiFi', 'Breakfast', 'Gym'],
        location: destination
      },
      {
        id: '3',
        name: 'Budget Stay Hotel',
        rating: 3,
        price: 1800,
        amenities: ['WiFi', 'AC'],
        location: destination
      }
    ]);
  };

  const toggleSelection = (type: BookingSelection['type'], data: any) => {
    setSelectedBookings(prev => {
      const exists = prev.find(b => b.type === type && b.data.id === data.id);
      if (exists) {
        return prev.filter(b => !(b.type === type && b.data.id === data.id));
      }
      // Remove other selections of same type
      return [...prev.filter(b => b.type !== type), { type, data }];
    });
  };

  const isSelected = (type: string, id: string) => {
    return selectedBookings.some(b => b.type === type && b.data.id === id);
  };

  const getTotalCost = () => {
    let total = 0;
    selectedBookings.forEach(booking => {
      if (booking.type === 'flight') total += booking.data.price;
      else if (booking.type === 'train') total += booking.data.classes?.[0]?.price || 0;
      else if (booking.type === 'bus') total += booking.data.price;
      else if (booking.type === 'hotel') total += booking.data.price * (itinerary.days?.length || 1);
    });
    return total;
  };

  const handleCheckout = async () => {
    if (selectedBookings.length === 0) {
      toast({
        title: "No Selection",
        description: "Please select at least one booking option.",
        variant: "destructive",
      });
      return;
    }

    if (!passengerName || !passengerEmail || !passengerPhone) {
      toast({
        title: "Missing Information",
        description: "Please fill in all passenger details.",
        variant: "destructive",
      });
      return;
    }

    setShowPayment(true);
  };

  const handlePayment = async () => {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast({
          title: "Not Authenticated",
          description: "Please log in to complete booking.",
          variant: "destructive",
        });
        navigate('/login');
        return;
      }

      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Create bookings for each selection
      const bookingPromises = selectedBookings.map(async (selection) => {
        let bookingData: any = {
          user_id: session.user.id,
          passenger_name: passengerName,
          passenger_email: passengerEmail,
          passenger_phone: passengerPhone,
          departure_date: itinerary.days?.[0]?.date || new Date().toISOString().split('T')[0],
          price_inr: 0,
          from_location: 'Your Location',
          to_location: destination || 'Destination',
        };

        if (selection.type === 'flight') {
          bookingData = {
            ...bookingData,
            booking_type: 'flight',
            service_name: selection.data.airline,
            service_number: selection.data.flightNumber,
            departure_time: selection.data.departure,
            arrival_time: selection.data.arrival,
            price_inr: selection.data.price,
            class_type: selection.data.class,
            seat_number: `${Math.floor(Math.random() * 30) + 1}A`,
          };
        } else if (selection.type === 'train') {
          bookingData = {
            ...bookingData,
            booking_type: 'train',
            service_name: selection.data.trainName,
            service_number: selection.data.trainNumber,
            departure_time: selection.data.departure,
            arrival_time: selection.data.arrival,
            price_inr: selection.data.classes?.[0]?.price || 0,
            class_type: selection.data.classes?.[0]?.class || 'Sleeper',
            seat_number: `S${Math.floor(Math.random() * 70) + 1}`,
          };
        } else if (selection.type === 'bus') {
          bookingData = {
            ...bookingData,
            booking_type: 'bus',
            service_name: selection.data.operator,
            service_number: selection.data.busNumber,
            departure_time: selection.data.departure,
            arrival_time: selection.data.arrival,
            price_inr: selection.data.price,
            class_type: selection.data.busType,
            seat_number: `${Math.floor(Math.random() * 40) + 1}`,
          };
        } else if (selection.type === 'hotel') {
          bookingData = {
            ...bookingData,
            booking_type: 'hotel',
            service_name: selection.data.name,
            service_number: `ROOM-${Math.floor(Math.random() * 500) + 100}`,
            departure_time: '14:00',
            arrival_time: '11:00',
            price_inr: selection.data.price * (itinerary.days?.length || 1),
            class_type: `${selection.data.rating} Star`,
          };
        }

        const { data } = await supabase.functions.invoke('create-booking', {
          body: bookingData
        });

        return data;
      });

      await Promise.all(bookingPromises);

      toast({
        title: "Booking Successful!",
        description: "Your bookings have been confirmed. Check My Tickets to view details.",
      });

      navigate('/my-tickets');
    } catch (error: any) {
      console.error('Booking error:', error);
      toast({
        title: "Booking Failed",
        description: error.message || "Failed to complete booking. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!itinerary) return null;

  if (showPayment) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container mx-auto px-4 py-8">
          <div className="max-w-md mx-auto">
            <Card>
              <CardHeader>
                <CardTitle>Payment</CardTitle>
                <CardDescription>Complete your booking payment</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Total Amount</Label>
                  <div className="text-3xl font-bold text-primary">
                    ₹{getTotalCost().toLocaleString('en-IN')}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Card Number (Demo)</Label>
                  <Input placeholder="4242 4242 4242 4242" defaultValue="4242 4242 4242 4242" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Expiry</Label>
                    <Input placeholder="MM/YY" defaultValue="12/25" />
                  </div>
                  <div className="space-y-2">
                    <Label>CVV</Label>
                    <Input placeholder="123" defaultValue="123" type="password" />
                  </div>
                </div>

                <div className="pt-4 space-y-2">
                  <Button onClick={handlePayment} disabled={loading} className="w-full" size="lg">
                    <CreditCard className="mr-2 h-4 w-4" />
                    {loading ? "Processing Payment..." : "Pay Now"}
                  </Button>
                  <Button onClick={() => setShowPayment(false)} variant="outline" className="w-full">
                    Back
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2">Book Your Trip</h1>
            <p className="text-muted-foreground">
              Select your travel options for {destination}
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Booking Options */}
            <div className="md:col-span-2">
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="flights">
                    <Plane className="h-4 w-4 mr-2" />
                    Flights
                  </TabsTrigger>
                  <TabsTrigger value="trains">
                    <Train className="h-4 w-4 mr-2" />
                    Trains
                  </TabsTrigger>
                  <TabsTrigger value="buses">
                    <Bus className="h-4 w-4 mr-2" />
                    Buses
                  </TabsTrigger>
                  <TabsTrigger value="hotels">
                    <Hotel className="h-4 w-4 mr-2" />
                    Hotels
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="flights" className="space-y-4">
                  {flights.map((flight) => (
                    <Card key={flight.id} className={isSelected('flight', flight.id) ? 'border-primary' : ''}>
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h3 className="font-semibold">{flight.airline}</h3>
                            <p className="text-sm text-muted-foreground">{flight.flightNumber}</p>
                          </div>
                          <Badge>{flight.class}</Badge>
                        </div>
                        <div className="flex justify-between items-center mb-3">
                          <div>
                            <p className="font-medium">{flight.departure}</p>
                            <p className="text-xs text-muted-foreground">{flight.from}</p>
                          </div>
                          <div className="text-center flex-1 px-4">
                            <p className="text-xs text-muted-foreground">{flight.duration}</p>
                            <div className="border-t my-1"></div>
                            <p className="text-xs">{flight.stops === 0 ? 'Non-stop' : `${flight.stops} stop(s)`}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-medium">{flight.arrival}</p>
                            <p className="text-xs text-muted-foreground">{flight.to}</p>
                          </div>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-xl font-bold text-primary">₹{flight.price.toLocaleString('en-IN')}</span>
                          <Button 
                            onClick={() => toggleSelection('flight', flight)}
                            variant={isSelected('flight', flight.id) ? 'default' : 'outline'}
                          >
                            {isSelected('flight', flight.id) ? 'Selected' : 'Select'}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </TabsContent>

                <TabsContent value="trains" className="space-y-4">
                  {trains.map((train) => (
                    <Card key={train.id} className={isSelected('train', train.id) ? 'border-primary' : ''}>
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h3 className="font-semibold">{train.trainName}</h3>
                            <p className="text-sm text-muted-foreground">{train.trainNumber}</p>
                          </div>
                          <Badge variant="outline">{train.runningDays}</Badge>
                        </div>
                        <div className="flex justify-between items-center mb-3">
                          <div>
                            <p className="font-medium">{train.departure}</p>
                            <p className="text-xs text-muted-foreground">{train.from}</p>
                          </div>
                          <div className="text-center flex-1 px-4">
                            <p className="text-xs text-muted-foreground">{train.duration}</p>
                            <div className="border-t my-1"></div>
                            <p className="text-xs">{train.date}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-medium">{train.arrival}</p>
                            <p className="text-xs text-muted-foreground">{train.to}</p>
                          </div>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-xl font-bold text-primary">
                            ₹{train.classes?.[0]?.price.toLocaleString('en-IN')} ({train.classes?.[0]?.class})
                          </span>
                          <Button 
                            onClick={() => toggleSelection('train', train)}
                            variant={isSelected('train', train.id) ? 'default' : 'outline'}
                          >
                            {isSelected('train', train.id) ? 'Selected' : 'Select'}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </TabsContent>

                <TabsContent value="buses" className="space-y-4">
                  {buses.map((bus) => (
                    <Card key={bus.id} className={isSelected('bus', bus.id) ? 'border-primary' : ''}>
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h3 className="font-semibold">{bus.operator}</h3>
                            <p className="text-sm text-muted-foreground">{bus.busType}</p>
                          </div>
                          <Badge>{bus.seatsAvailable} seats left</Badge>
                        </div>
                        <div className="flex justify-between items-center mb-3">
                          <div>
                            <p className="font-medium">{bus.departure}</p>
                            <p className="text-xs text-muted-foreground">{bus.from}</p>
                          </div>
                          <div className="text-center flex-1 px-4">
                            <p className="text-xs text-muted-foreground">{bus.duration}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-medium">{bus.arrival}</p>
                            <p className="text-xs text-muted-foreground">{bus.to}</p>
                          </div>
                        </div>
                        <div className="mb-2">
                          <p className="text-xs text-muted-foreground">Amenities: {bus.amenities?.join(', ')}</p>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-xl font-bold text-primary">₹{bus.price.toLocaleString('en-IN')}</span>
                          <Button 
                            onClick={() => toggleSelection('bus', bus)}
                            variant={isSelected('bus', bus.id) ? 'default' : 'outline'}
                          >
                            {isSelected('bus', bus.id) ? 'Selected' : 'Select'}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </TabsContent>

                <TabsContent value="hotels" className="space-y-4">
                  {hotels.map((hotel) => (
                    <Card key={hotel.id} className={isSelected('hotel', hotel.id) ? 'border-primary' : ''}>
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h3 className="font-semibold">{hotel.name}</h3>
                            <p className="text-sm text-muted-foreground">{hotel.location}</p>
                          </div>
                          <Badge>{'⭐'.repeat(hotel.rating)}</Badge>
                        </div>
                        <div className="mb-3">
                          <p className="text-sm text-muted-foreground">
                            Amenities: {hotel.amenities.join(', ')}
                          </p>
                        </div>
                        <div className="flex justify-between items-center">
                          <div>
                            <span className="text-xl font-bold text-primary">₹{hotel.price.toLocaleString('en-IN')}</span>
                            <span className="text-sm text-muted-foreground"> / night</span>
                            <p className="text-xs text-muted-foreground">
                              Total: ₹{(hotel.price * (itinerary.days?.length || 1)).toLocaleString('en-IN')} for {itinerary.days?.length || 1} nights
                            </p>
                          </div>
                          <Button 
                            onClick={() => toggleSelection('hotel', hotel)}
                            variant={isSelected('hotel', hotel.id) ? 'default' : 'outline'}
                          >
                            {isSelected('hotel', hotel.id) ? 'Selected' : 'Select'}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </TabsContent>
              </Tabs>
            </div>

            {/* Booking Summary */}
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Passenger Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Full Name</Label>
                    <Input 
                      value={passengerName} 
                      onChange={(e) => setPassengerName(e.target.value)}
                      placeholder="John Doe"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Email</Label>
                    <Input 
                      type="email"
                      value={passengerEmail} 
                      onChange={(e) => setPassengerEmail(e.target.value)}
                      placeholder="john@example.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Phone</Label>
                    <Input 
                      value={passengerPhone} 
                      onChange={(e) => setPassengerPhone(e.target.value)}
                      placeholder="+91 9876543210"
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Booking Summary</CardTitle>
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
                    {selectedBookings.map((booking, idx) => (
                      <div key={idx} className="flex justify-between text-sm">
                        <span className="text-muted-foreground capitalize">{booking.type}</span>
                        <span className="font-medium">Selected</span>
                      </div>
                    ))}
                  </div>

                  <div className="border-t pt-4">
                    <div className="flex justify-between items-center mb-4">
                      <span className="font-semibold">Total Amount</span>
                      <span className="text-2xl font-bold text-primary">
                        ₹{getTotalCost().toLocaleString('en-IN')}
                      </span>
                    </div>
                    
                    <Button
                      onClick={handleCheckout}
                      disabled={loading || selectedBookings.length === 0}
                      className="w-full"
                      size="lg"
                    >
                      <CreditCard className="mr-2 h-4 w-4" />
                      Proceed to Payment
                    </Button>
                  </div>

                  {selectedBookings.length > 0 && (
                    <div className="text-center pt-4 border-t">
                      <QrCode className="h-12 w-12 mx-auto mb-2 text-muted-foreground/50" />
                      <p className="text-xs text-muted-foreground">
                        QR codes will be generated after booking
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}