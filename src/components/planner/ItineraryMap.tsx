import React from 'react';

interface ItineraryStep {
  location?: string;
  [key: string]: any;
}

interface ItineraryMapProps {
  steps: ItineraryStep[];
  destination: string;
}

const ItineraryMap: React.FC<ItineraryMapProps> = ({ steps, destination }) => {
  // 1. Get all the locations from your steps
  const locations = steps
    .filter(step => step.location) // Only keep steps with locations
    .map(step => step.location as string);

  // 2. If no locations, just show the destination city
  if (locations.length === 0) {
    return (
      <div className="w-full h-[450px] bg-muted rounded-xl overflow-hidden">
        <iframe
          width="100%"
          height="100%"
          style={{ border: 0 }}
          loading="lazy"
          allowFullScreen
          referrerPolicy="no-referrer-when-downgrade"
          src={`https://www.google.com/maps/embed/v1/place?key=${import.meta.env.VITE_GOOGLE_MAPS_KEY}&q=${encodeURIComponent(destination)}`}
        ></iframe>
      </div>
    );
  }

  // 3. THE MAGIC: "Directions Mode" (Unlimited Free Usage)
  const origin = locations[0]; // First stop
  const finalDestination = locations[locations.length - 1]; // Last stop
  const waypoints = locations.slice(1, -1).join('|'); // Middle stops joined by pipe |

  return (
    <div className="w-full h-[450px] bg-muted rounded-xl overflow-hidden shadow-lg border border-border">
      <iframe
        width="100%"
        height="100%"
        style={{ border: 0 }}
        loading="lazy"
        allowFullScreen
        referrerPolicy="no-referrer-when-downgrade"
        src={`https://www.google.com/maps/embed/v1/directions?key=${import.meta.env.VITE_GOOGLE_MAPS_KEY}&origin=${encodeURIComponent(origin)}&destination=${encodeURIComponent(finalDestination)}&waypoints=${encodeURIComponent(waypoints)}`}
      ></iframe>
    </div>
  );
};

export default ItineraryMap;
