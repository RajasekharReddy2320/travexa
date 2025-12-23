import React from 'react';
import { ItineraryStep } from '@/types/tripPlanner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin } from 'lucide-react';

interface ItineraryMapProps {
  steps: ItineraryStep[];
  destination: string;
}

const ItineraryMap: React.FC<ItineraryMapProps> = ({ steps, destination }) => {
  // Create a Google Maps embed URL with the destination
  const encodedDestination = encodeURIComponent(destination);
  const mapEmbedUrl = `https://www.google.com/maps?q=${encodedDestination}&output=embed`;

  return (
    <Card className="mb-8">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <MapPin size={20} className="text-primary" />
          Trip Overview - {destination}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="rounded-xl overflow-hidden">
          <iframe
            src={mapEmbedUrl}
            width="100%"
            height="300"
            style={{ border: 0 }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title={`Map of ${destination}`}
            className="rounded-xl"
          />
        </div>
        <div className="flex flex-wrap justify-center gap-2 mt-4">
          {steps.slice(0, 5).map((step) => (
            <span
              key={step.id}
              className="bg-muted px-3 py-1 rounded-full text-xs font-medium"
            >
              {step.location}
            </span>
          ))}
          {steps.length > 5 && (
            <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-medium">
              +{steps.length - 5} more
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ItineraryMap;
