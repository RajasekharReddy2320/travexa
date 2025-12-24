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
  // Build waypoints from ALL steps in chronological order (sorted by day and time)
  const sortedSteps = [...steps].sort((a, b) => {
    if (a.day !== b.day) return a.day - b.day;
    return a.time.localeCompare(b.time);
  });

  // Build ordered list of all stops: origin -> all locations in order -> final destination
  const buildOrderedStops = () => {
    const stops: { label: string; location: string; category: string }[] = [];
    
    // Start with origin (airport/station)
    if (origin) {
      stops.push({ label: 'Start', location: origin, category: 'origin' });
    }
    
    // Add all itinerary steps in chronological order
    sortedSteps.forEach(step => {
      // Include all meaningful categories
      if (['accommodation', 'food', 'sightseeing', 'activity', 'transport'].includes(step.category)) {
        stops.push({ 
          label: step.title, 
          location: step.location, 
          category: step.category 
        });
      }
    });
    
    return stops;
  };

  const orderedStops = buildOrderedStops();
  
  // Extract just locations for the map URL
  const allLocations = orderedStops.map(stop => stop.location);

  // Build Google Maps directions URL with all waypoints
  const buildMapsUrl = () => {
    if (allLocations.length < 2) {
      return `https://www.google.com/maps/embed?pb=!1m14!1m12!1m3!1d15000!2d0!3d0!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!5e0!3m2!1sen!2sin!4v1`;
    }

    const start = allLocations[0];
    const end = allLocations[allLocations.length - 1];
    const waypoints = allLocations.slice(1, -1);
    
    // Build the dir URL format: /dir/origin/waypoint1/waypoint2/.../destination
    const locations = [start, ...waypoints, end].map(loc => encodeURIComponent(loc)).join('/');
    
    return `https://www.google.com/maps/embed?pb=!1m28!1m12!1m3!1d500000!2d77.5946!3d12.9716!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!4m13!3e0!4m5!1s${encodeURIComponent(start)}!2s${encodeURIComponent(start)}!3m2!1d0!2d0!4m5!1s${encodeURIComponent(end)}!2s${encodeURIComponent(end)}!3m2!1d0!2d0!5e0!3m2!1sen!2sin`;
  };

  // Use directions URL with all stops
  const directionsUrl = () => {
    if (allLocations.length === 0) {
      return `https://www.google.com/maps?q=${encodeURIComponent(destination)}&output=embed`;
    }
    
    // Build a proper directions URL with all stops
    const start = allLocations[0];
    const end = allLocations[allLocations.length - 1];
    const waypoints = allLocations.slice(1, -1);
    
    let url = `https://www.google.com/maps/dir/${encodeURIComponent(start)}`;
    waypoints.forEach(wp => {
      url += `/${encodeURIComponent(wp)}`;
    });
    url += `/${encodeURIComponent(end)}`;
    url += `?output=embed`;
    
    return url;
  };

  return (
    <Card className="mb-8">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <MapPin size={20} className="text-primary" />
          Route Overview - {allLocations.length} Stops
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="rounded-xl overflow-hidden">
          <iframe
            src={directionsUrl()}
            width="100%"
            height="400"
            style={{ border: 0 }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title={`Route with ${allLocations.length} stops`}
            className="rounded-xl"
          />
        </div>
        
        {/* Stops Legend */}
        <div className="mt-4">
          <p className="text-sm font-medium text-muted-foreground mb-2">Stops in order:</p>
          <div className="flex flex-wrap gap-2">
            {orderedStops.map((stop, index) => (
              <span
                key={`${stop.location}-${index}`}
                className={`px-3 py-1 rounded-full text-xs font-medium ${
                  stop.category === 'origin' 
                    ? 'bg-primary text-primary-foreground' 
                    : stop.category === 'accommodation'
                    ? 'bg-blue-500/20 text-blue-700 dark:text-blue-300'
                    : stop.category === 'food'
                    ? 'bg-orange-500/20 text-orange-700 dark:text-orange-300'
                    : stop.category === 'sightseeing'
                    ? 'bg-green-500/20 text-green-700 dark:text-green-300'
                    : 'bg-muted text-muted-foreground'
                }`}
              >
                {String.fromCharCode(65 + index)}. {stop.label}
              </span>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ItineraryMap;
