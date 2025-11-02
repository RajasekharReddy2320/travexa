import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardNav from "@/components/DashboardNav";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Plane, Train, Bus, QrCode, Download, Calendar, MapPin } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

export default function MyTickets() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/login');
        return;
      }

      const { data, error } = await supabase
        .from('bookings')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setBookings(data || []);
    } catch (error: any) {
      console.error('Error fetching bookings:', error);
      toast({
        title: "Error",
        description: "Failed to load your tickets",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-500';
      case 'cancelled': return 'bg-red-500';
      case 'completed': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500';
      case 'pending': return 'bg-yellow-500';
      case 'failed': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'flight': return Plane;
      case 'train': return Train;
      case 'bus': return Bus;
      default: return MapPin;
    }
  };

  const filterBookings = (filter: string) => {
    if (filter === 'all') return bookings;
    return bookings.filter(b => b.booking_type === filter);
  };

  const handleViewTicket = (booking: any) => {
    navigate('/ticket-details', { state: { booking } });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <DashboardNav />
        <div className="container mx-auto px-4 py-8">
          <p className="text-center">Loading your tickets...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <DashboardNav />
      
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">My Tickets</h1>
          <p className="text-muted-foreground">View and manage your bookings</p>
        </div>

        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-8">
            <TabsTrigger value="all">All Tickets</TabsTrigger>
            <TabsTrigger value="flight">Flights</TabsTrigger>
            <TabsTrigger value="train">Trains</TabsTrigger>
            <TabsTrigger value="bus">Buses</TabsTrigger>
          </TabsList>

          {['all', 'flight', 'train', 'bus'].map((tabValue) => (
            <TabsContent key={tabValue} value={tabValue}>
              <div className="space-y-4">
                {filterBookings(tabValue).length === 0 ? (
                  <Card>
                    <CardContent className="p-8 text-center text-muted-foreground">
                      <p className="mb-4">No tickets found</p>
                      <Button onClick={() => navigate('/book-transport')}>
                        Book Your First Trip
                      </Button>
                    </CardContent>
                  </Card>
                ) : (
                  filterBookings(tabValue).map((booking) => {
                    const Icon = getIcon(booking.booking_type);
                    return (
                      <Card key={booking.id} className="hover:shadow-lg transition-shadow">
                        <CardContent className="p-6">
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center gap-3">
                              <div className="p-3 bg-primary/10 rounded-lg">
                                <Icon className="h-6 w-6 text-primary" />
                              </div>
                              <div>
                                <h3 className="font-semibold text-lg">{booking.service_name}</h3>
                                <p className="text-sm text-muted-foreground">{booking.service_number}</p>
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <Badge className={getStatusColor(booking.status)}>
                                {booking.status}
                              </Badge>
                              <Badge className={getPaymentStatusColor(booking.payment_status)}>
                                {booking.payment_status}
                              </Badge>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                            <div>
                              <p className="text-sm text-muted-foreground flex items-center gap-1">
                                <MapPin className="h-3 w-3" />
                                Route
                              </p>
                              <p className="font-semibold">{booking.from_location} → {booking.to_location}</p>
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                Journey Date
                              </p>
                              <p className="font-semibold">
                                {new Date(booking.departure_date).toLocaleDateString('en-IN')}
                              </p>
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground">Booking Reference</p>
                              <p className="font-semibold font-mono">{booking.booking_reference}</p>
                            </div>
                          </div>

                          <div className="flex items-center justify-between pt-4 border-t">
                            <div>
                              <p className="text-sm text-muted-foreground">Passenger</p>
                              <p className="font-semibold">{booking.passenger_name}</p>
                              <p className="text-sm">Seat: {booking.seat_number} | Class: {booking.class_type}</p>
                            </div>
                            <div className="flex gap-2">
                              <Button variant="outline" size="sm" onClick={() => handleViewTicket(booking)}>
                                <QrCode className="mr-2 h-4 w-4" />
                                View QR
                              </Button>
                              <Button size="sm" onClick={() => handleViewTicket(booking)}>
                                <Download className="mr-2 h-4 w-4" />
                                Download
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })
                )}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </div>
  );
}
