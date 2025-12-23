import React from 'react';
import { ItineraryStep } from '@/types/tripPlanner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin } from 'lucide-react';

interface ItineraryMapProps {
  steps: ItineraryStep[];
  destination: string;
  origin: string;
}

const ItineraryMap: React.FC<ItineraryMapProps> = ({ steps, destination, origin }) => {
  // Build waypoints from steps in chronological order (sorted by day and time)
  const sortedSteps = [...steps].sort((a, b) => {
    if (a.day !== b.day) return a.day - b.day;
    return a.time.localeCompare(b.time);
  });

  // Get unique locations for hotels, restaurants, and key spots
  const waypoints = sortedSteps
    .filter(step => 
      step.category === 'accommodation' || 
      step.category === 'food' || 
      step.category === 'sightseeing' ||
      step.category === 'activity'
    )
    .map(step => step.location);

  // Build Google Maps directions URL with waypoints
  const buildMapsUrl = () => {
    const encodedOrigin = encodeURIComponent(origin || destination);
    const encodedDestination = encodeURIComponent(destination);
    
    if (waypoints.length === 0) {
      return `https://www.google.com/maps/embed/v1/directions?key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8&origin=${encodedOrigin}&destination=${encodedDestination}&mode=driving`;
    }

    // Take up to 8 waypoints (Google Maps embed limit) in order
    const limitedWaypoints = waypoints.slice(0, 8);
    const waypointsParam = limitedWaypoints.map(w => encodeURIComponent(w)).join('|');
    
    return `https://www.google.com/maps/embed/v1/directions?key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8&origin=${encodedOrigin}&destination=${encodedDestination}&waypoints=${waypointsParam}&mode=driving`;
  };

  // Fallback to simple place embed if API key doesn't work
  const simpleMapsUrl = () => {
    const allLocations = [origin, ...waypoints.slice(0, 5), destination].filter(Boolean);
    const query = allLocations.join(' to ');
    return `https://www.google.com/maps?q=${encodeURIComponent(query)}&output=embed`;
  };

  return (
    <Card className="mb-8">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <MapPin size={20} className="text-primary" />
          Route Overview - {origin} → {destination}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="rounded-xl overflow-hidden">
          <iframe
            src={simpleMapsUrl()}
            width="100%"
            height="350"
            style={{ border: 0 }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title={`Route from ${origin} to ${destination}`}
            className="rounded-xl"
          />
        </div>
        
        {/* Stops Legend */}
        <div className="mt-4">
          <p className="text-sm font-medium text-muted-foreground mb-2">Stops in order:</p>
          <div className="flex flex-wrap gap-2">
            <span className="bg-primary text-primary-foreground px-3 py-1 rounded-full text-xs font-medium">
              1. {origin || 'Start'}
            </span>
            {sortedSteps
              .filter(step => 
                step.category === 'accommodation' || 
                step.category === 'food' ||
                step.category === 'sightseeing' ||
                step.category === 'activity'
              )
              .slice(0, 8)
              .map((step, index) => (
                <span
                  key={step.id}
                  className="bg-muted px-3 py-1 rounded-full text-xs font-medium"
                >
                  {index + 2}. {step.title} ({step.location})
                </span>
              ))}
            <span className="bg-primary text-primary-foreground px-3 py-1 rounded-full text-xs font-medium">
              {waypoints.length + 2}. {destination}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ItineraryMap;
