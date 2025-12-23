import React from 'react';
import { ItineraryStep } from '@/types/tripPlanner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin } from 'lucide-react';

interface ItineraryMapProps {
  steps: ItineraryStep[];
}

const ItineraryMap: React.FC<ItineraryMapProps> = ({ steps }) => {
  const locations = steps.filter(s => s.coordinates);

  return (
    <Card className="mb-8">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <MapPin size={20} className="text-primary" />
          Trip Overview
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="bg-muted rounded-xl p-6 min-h-[200px] flex items-center justify-center">
          <div className="text-center text-muted-foreground">
            <MapPin size={48} className="mx-auto mb-3 opacity-50" />
            <p className="font-medium">Interactive Map</p>
            <p className="text-sm">
              {locations.length} locations in your itinerary
            </p>
            <div className="flex flex-wrap justify-center gap-2 mt-4">
              {steps.slice(0, 5).map((step) => (
                <span
                  key={step.id}
                  className="bg-background px-3 py-1 rounded-full text-xs font-medium"
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
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ItineraryMap;
