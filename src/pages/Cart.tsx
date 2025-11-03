import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "@/contexts/CartContext";
import DashboardNav from "@/components/DashboardNav";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Trash2, ShoppingCart, Plane, Train, Bus } from "lucide-react";

const Cart = () => {
  const navigate = useNavigate();
  const { items, removeFromCart, clearCart, totalPrice, itemCount } = useCart();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);

  const getIcon = (type: string) => {
    switch (type) {
      case "flight":
        return <Plane className="h-5 w-5" />;
      case "train":
        return <Train className="h-5 w-5" />;
      case "bus":
        return <Bus className="h-5 w-5" />;
      default:
        return <ShoppingCart className="h-5 w-5" />;
    }
  };

  const handleCheckout = async () => {
    setIsProcessing(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        navigate("/login");
        return;
      }

      // Process all bookings
      const bookingPromises = items.map(async (item) => {
        const { data, error } = await supabase.functions.invoke("create-booking", {
          body: {
            user_id: user.id,
            booking_type: item.booking_type,
            service_name: item.service_name,
            service_number: item.service_number,
            from_location: item.from_location,
            to_location: item.to_location,
            departure_date: item.departure_date,
            departure_time: item.departure_time,
            arrival_time: item.arrival_time,
            duration: item.duration,
            price_inr: item.price_inr,
            passenger_name: item.passenger_name,
            passenger_email: item.passenger_email,
            passenger_phone: item.passenger_phone,
            seat_number: item.seat_number,
            class_type: item.class_type,
          },
        });

        if (error) throw error;
        return data;
      });

      await Promise.all(bookingPromises);

      toast({
        title: "Booking Successful!",
        description: `${itemCount} ticket(s) booked successfully for ₹${totalPrice.toLocaleString("en-IN")}`,
      });

      clearCart();
      navigate("/my-tickets");
    } catch (error) {
      console.error("Error processing cart:", error);
      toast({
        title: "Booking Failed",
        description: "There was an error processing your bookings. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  if (itemCount === 0) {
    return (
      <div className="min-h-screen bg-background">
        <DashboardNav />
        <div className="container py-8">
          <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
            <ShoppingCart className="h-24 w-24 text-muted-foreground mb-4" />
            <h2 className="text-2xl font-bold mb-2">Your cart is empty</h2>
            <p className="text-muted-foreground mb-6">Add tickets to your cart to book multiple trips at once</p>
            <Button onClick={() => navigate("/book-transport")}>
              Browse Tickets
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <DashboardNav />
      <div className="container py-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold">Your Cart</h1>
              <p className="text-muted-foreground">{itemCount} item(s) in cart</p>
            </div>
            <Button variant="outline" onClick={clearCart}>
              Clear All
            </Button>
          </div>

          <div className="space-y-4">
            {items.map((item) => (
              <Card key={item.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        {getIcon(item.booking_type)}
                      </div>
                      <div>
                        <CardTitle className="text-lg">{item.service_name}</CardTitle>
                        <p className="text-sm text-muted-foreground">{item.service_number}</p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeFromCart(item.id)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">From</p>
                      <p className="font-medium">{item.from_location}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">To</p>
                      <p className="font-medium">{item.to_location}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Date</p>
                      <p className="font-medium">{item.departure_date}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Time</p>
                      <p className="font-medium">{item.departure_time}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Passenger</p>
                      <p className="font-medium">{item.passenger_name}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-muted-foreground">Price</p>
                      <p className="text-lg font-bold text-primary">
                        ₹{item.price_inr.toLocaleString("en-IN")}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Subtotal ({itemCount} items)</span>
                <span>₹{totalPrice.toLocaleString("en-IN")}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Platform Fee</span>
                <span>₹0</span>
              </div>
              <Separator />
              <div className="flex justify-between font-bold text-lg">
                <span>Total</span>
                <span>₹{totalPrice.toLocaleString("en-IN")}</span>
              </div>
            </CardContent>
            <CardFooter>
              <Button
                className="w-full"
                size="lg"
                onClick={handleCheckout}
                disabled={isProcessing}
              >
                {isProcessing ? "Processing..." : `Proceed to Checkout - ₹${totalPrice.toLocaleString("en-IN")}`}
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Cart;
