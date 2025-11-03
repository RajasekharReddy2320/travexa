import { useEffect, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Plane, Train, Bus, MapPin, Calendar, Clock, CheckCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Html5Qrcode } from "html5-qrcode";

interface ScannedSegment {
  booking_type: string;
  service_name: string;
  service_number: string;
  from_location: string;
  to_location: string;
  departure_date: string;
  departure_time: string;
  arrival_time: string;
  seat_number: string;
  class_type: string;
  segment_order: number;
  status: string;
}

export default function QRScanner() {
  const [scanning, setScanning] = useState(false);
  const [scannedData, setScannedData] = useState<any>(null);
  const [segments, setSegments] = useState<ScannedSegment[]>([]);
  const [currentSegment, setCurrentSegment] = useState<ScannedSegment | null>(null);
  const [error, setError] = useState<string | null>(null);
  const scannerRef = useRef<Html5Qrcode | null>(null);

  const getIcon = (type: string) => {
    switch (type) {
      case "flight": return Plane;
      case "train": return Train;
      case "bus": return Bus;
      default: return MapPin;
    }
  };

  const determineCurrentSegment = (segments: ScannedSegment[]) => {
    const now = new Date();
    
    // Find which segment we're currently in based on time
    for (let i = 0; i < segments.length; i++) {
      const segment = segments[i];
      const departureTime = new Date(`${segment.departure_date}T${segment.departure_time}`);
      
      // If we haven't reached departure time of this segment, show this one
      if (now < departureTime) {
        return segment;
      }
      
      // If we're past departure but before next segment (or last segment), show next
      if (i < segments.length - 1) {
        const nextDeparture = new Date(`${segments[i + 1].departure_date}T${segments[i + 1].departure_time}`);
        if (now >= departureTime && now < nextDeparture) {
          return segments[i + 1]; // Show next upcoming segment
        }
      }
    }
    
    // All segments completed - return null to show all
    return null;
  };

  const startScanning = async () => {
    try {
      setError(null);
      const html5QrCode = new Html5Qrcode("qr-reader");
      scannerRef.current = html5QrCode;

      await html5QrCode.start(
        { facingMode: "environment" },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
        },
        async (decodedText) => {
          // Stop scanning after successful scan
          html5QrCode.stop();
          setScanning(false);
          
          try {
            // Parse QR data
            const qrData = JSON.parse(atob(decodedText));
            setScannedData(qrData);

            // Fetch trip segments
            const { data: segmentsData, error: segmentsError } = await supabase
              .from('trip_segments')
              .select('*')
              .eq('trip_group_id', qrData.tripGroupId)
              .order('segment_order', { ascending: true });

            if (segmentsError) throw segmentsError;

            if (segmentsData && segmentsData.length > 0) {
              setSegments(segmentsData);
              const current = determineCurrentSegment(segmentsData);
              setCurrentSegment(current);
            }
          } catch (err) {
            setError("Invalid QR code format");
          }
        },
        (errorMessage) => {
          console.log("QR Scan error:", errorMessage);
        }
      );

      setScanning(true);
    } catch (err) {
      console.error("Error starting scanner:", err);
      setError("Failed to start camera. Please check permissions.");
    }
  };

  const stopScanning = () => {
    if (scannerRef.current) {
      scannerRef.current.stop();
      setScanning(false);
    }
  };

  const resetScanner = () => {
    setScannedData(null);
    setSegments([]);
    setCurrentSegment(null);
    setError(null);
  };

  useEffect(() => {
    return () => {
      if (scannerRef.current) {
        scannerRef.current.stop();
      }
    };
  }, []);

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <h1 className="text-3xl font-bold mb-6">Ticket QR Scanner</h1>

      {!scannedData && (
        <Card>
          <CardHeader>
            <CardTitle>Scan Ticket QR Code</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            <div id="qr-reader" className="w-full"></div>

            {!scanning ? (
              <Button onClick={startScanning} className="w-full">
                Start Scanner
              </Button>
            ) : (
              <Button onClick={stopScanning} variant="outline" className="w-full">
                Stop Scanner
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {scannedData && segments.length > 0 && (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Trip Details</CardTitle>
                <Button onClick={resetScanner} variant="outline" size="sm">
                  Scan Another
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="text-muted-foreground">Reference:</span>{" "}
                  <span className="font-mono font-semibold">{scannedData.ref}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Passenger:</span>{" "}
                  <span className="font-semibold">{scannedData.passenger}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Total Segments:</span>{" "}
                  <span className="font-semibold">{segments.length}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {currentSegment ? (
            <Card className="border-primary">
              <CardHeader className="bg-primary/10">
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-primary" />
                  Current/Upcoming Journey
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    {getIcon(currentSegment.booking_type)({ className: "h-5 w-5 text-primary" })}
                  </div>
                  <div>
                    <h3 className="font-semibold">{currentSegment.service_name}</h3>
                    <p className="text-sm text-muted-foreground">{currentSegment.service_number}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="flex items-center gap-2 text-muted-foreground mb-1">
                      <MapPin className="h-4 w-4" />
                      <span className="text-xs">FROM</span>
                    </div>
                    <p className="font-semibold">{currentSegment.from_location}</p>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {currentSegment.departure_time}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center justify-end gap-2 text-muted-foreground mb-1">
                      <span className="text-xs">TO</span>
                      <MapPin className="h-4 w-4" />
                    </div>
                    <p className="font-semibold">{currentSegment.to_location}</p>
                    <div className="flex items-center justify-end gap-1 text-sm text-muted-foreground">
                      {currentSegment.arrival_time}
                      <Clock className="h-3 w-3" />
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t">
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">
                      {new Date(currentSegment.departure_date).toLocaleDateString('en-IN', { dateStyle: 'full' })}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-muted-foreground">Seat:</span>{" "}
                      <span className="font-semibold">{currentSegment.seat_number}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Class:</span>{" "}
                      <span className="font-semibold">{currentSegment.class_type}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  Journey Complete - All Segments
                </CardTitle>
              </CardHeader>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>All Journey Segments</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {segments.map((segment, index) => {
                const Icon = getIcon(segment.booking_type);
                const isPast = new Date() > new Date(`${segment.departure_date}T${segment.departure_time}`);
                
                return (
                  <div
                    key={index}
                    className={`p-3 border rounded-lg ${
                      segment === currentSegment ? 'border-primary bg-primary/5' : ''
                    } ${isPast ? 'opacity-60' : ''}`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-xs font-bold">
                        {index + 1}
                      </div>
                      <Icon className="h-4 w-4" />
                      <span className="text-sm font-semibold">{segment.service_name}</span>
                      {isPast && (
                        <CheckCircle className="h-4 w-4 text-green-500 ml-auto" />
                      )}
                    </div>
                    <div className="text-sm text-muted-foreground ml-8">
                      {segment.from_location} → {segment.to_location}
                    </div>
                    <div className="text-xs text-muted-foreground ml-8">
                      {new Date(segment.departure_date).toLocaleDateString('en-IN')} at {segment.departure_time}
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
