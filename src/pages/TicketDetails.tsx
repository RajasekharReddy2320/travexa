import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useRef } from "react";
import DashboardNav from "@/components/DashboardNav";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Plane, Train, Bus, MapPin, Calendar, Clock, User, CreditCard, Download, Printer } from "lucide-react";
import QRCode from "qrcode";

export default function TicketDetails() {
  const location = useLocation();
  const navigate = useNavigate();
  const { booking } = location.state || {};
  const qrCanvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (booking && qrCanvasRef.current) {
      // Decode QR data and generate QR code
      try {
        const qrData = JSON.parse(atob(booking.qr_code));
        const qrText = `TRAVEXA TICKET\nRef: ${qrData.ref}\nType: ${qrData.type}\nFrom: ${qrData.from}\nTo: ${qrData.to}\nDate: ${qrData.date}\nTime: ${qrData.time}\nPassenger: ${qrData.passenger}\nSeat: ${qrData.seat}`;
        
        QRCode.toCanvas(qrCanvasRef.current, qrText, {
          width: 256,
          margin: 2,
          color: {
            dark: '#000000',
            light: '#FFFFFF',
          },
        });
      } catch (error) {
        console.error('Error generating QR code:', error);
      }
    }
  }, [booking]);

  if (!booking) {
    navigate('/my-tickets');
    return null;
  }

  const getIcon = (type: string) => {
    switch (type) {
      case 'flight': return Plane;
      case 'train': return Train;
      case 'bus': return Bus;
      default: return MapPin;
    }
  };

  const Icon = getIcon(booking.booking_type);

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    if (qrCanvasRef.current) {
      const link = document.createElement('a');
      link.download = `ticket-${booking.booking_reference}.png`;
      link.href = qrCanvasRef.current.toDataURL();
      link.click();
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <DashboardNav />
      
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8 flex items-center justify-between print:hidden">
          <div>
            <h1 className="text-4xl font-bold mb-2">Ticket Details</h1>
            <p className="text-muted-foreground">Booking Reference: {booking.booking_reference}</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handlePrint}>
              <Printer className="mr-2 h-4 w-4" />
              Print
            </Button>
            <Button onClick={handleDownload}>
              <Download className="mr-2 h-4 w-4" />
              Download
            </Button>
          </div>
        </div>

        <Card className="mb-6">
          <CardHeader className="bg-primary text-primary-foreground">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Icon className="h-8 w-8" />
                <div>
                  <CardTitle className="text-2xl">{booking.service_name}</CardTitle>
                  <p className="text-primary-foreground/80">{booking.service_number}</p>
                </div>
              </div>
              <Badge className="bg-white text-primary">
                {booking.booking_type.toUpperCase()}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            {/* Journey Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-6">
              <div>
                <div className="flex items-center gap-2 text-muted-foreground mb-2">
                  <MapPin className="h-4 w-4" />
                  <span className="text-sm font-semibold">FROM</span>
                </div>
                <p className="text-2xl font-bold mb-1">{booking.from_location}</p>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span>{booking.departure_time}</span>
                </div>
              </div>
              <div className="text-right">
                <div className="flex items-center justify-end gap-2 text-muted-foreground mb-2">
                  <span className="text-sm font-semibold">TO</span>
                  <MapPin className="h-4 w-4" />
                </div>
                <p className="text-2xl font-bold mb-1">{booking.to_location}</p>
                <div className="flex items-center justify-end gap-2 text-muted-foreground">
                  <span>{booking.arrival_time}</span>
                  <Clock className="h-4 w-4" />
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 text-muted-foreground mb-6">
              <Calendar className="h-4 w-4" />
              <span className="font-semibold">
                {new Date(booking.departure_date).toLocaleDateString('en-IN', { dateStyle: 'full' })}
              </span>
            </div>

            <Separator className="my-6" />

            {/* Passenger Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Passenger Details
                </h3>
                <div className="space-y-2 text-sm">
                  <div>
                    <p className="text-muted-foreground">Name</p>
                    <p className="font-semibold">{booking.passenger_name}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Email</p>
                    <p className="font-semibold">{booking.passenger_email}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Phone</p>
                    <p className="font-semibold">{booking.passenger_phone}</p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-3">Booking Information</h3>
                <div className="space-y-2 text-sm">
                  <div>
                    <p className="text-muted-foreground">Seat Number</p>
                    <p className="font-semibold">{booking.seat_number}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Class</p>
                    <p className="font-semibold">{booking.class_type}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Status</p>
                    <Badge variant="secondary">{booking.status}</Badge>
                  </div>
                </div>
              </div>
            </div>

            <Separator className="my-6" />

            {/* Payment Details */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="font-semibold mb-1 flex items-center gap-2">
                  <CreditCard className="h-4 w-4" />
                  Payment Information
                </h3>
                <p className="text-sm text-muted-foreground">Payment ID: {booking.payment_id}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Total Paid</p>
                <p className="text-3xl font-bold text-primary">₹{booking.price_inr.toLocaleString()}</p>
              </div>
            </div>

            <Separator className="my-6" />

            {/* QR Code */}
            <div className="text-center">
              <h3 className="font-semibold mb-4">Ticket QR Code</h3>
              <div className="inline-block p-4 bg-white rounded-lg shadow-inner">
                <canvas ref={qrCanvasRef} />
              </div>
              <p className="text-sm text-muted-foreground mt-4">
                Show this QR code at the time of boarding
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-yellow-50 dark:bg-yellow-950 border-yellow-200 dark:border-yellow-800">
          <CardContent className="p-4">
            <h4 className="font-semibold mb-2">Important Information</h4>
            <ul className="text-sm space-y-1 text-muted-foreground list-disc list-inside">
              <li>Please arrive at least 30 minutes before departure</li>
              <li>Carry a valid ID proof for verification</li>
              <li>This ticket is non-transferable</li>
              <li>For cancellations, contact support at least 24 hours before departure</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
