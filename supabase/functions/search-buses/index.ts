import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Fake bus data generator
const operators = ['RedBus', 'VRL Travels', 'SRS Travels', 'Orange Travels', 'Parveen Travels', 'Raj Travels', 'KPN Travels'];
const busTypes = ['AC Sleeper', 'Non-AC Sleeper', 'AC Seater', 'Volvo AC', 'Multi-Axle', 'Semi-Sleeper'];

function generateBuses(from: string, to: string, date: string) {
  const buses = [];
  const numBuses = 6 + Math.floor(Math.random() * 8);
  
  for (let i = 0; i < numBuses; i++) {
    const operator = operators[Math.floor(Math.random() * operators.length)];
    const busType = busTypes[Math.floor(Math.random() * busTypes.length)];
    const hour = 6 + Math.floor(Math.random() * 18);
    const minute = Math.floor(Math.random() * 60);
    const duration = 120 + Math.floor(Math.random() * 600);
    const basePrice = 400 + Math.floor(Math.random() * 1500);
    
    buses.push({
      id: `BS${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
      operator,
      busType,
      from: from,
      to: to,
      departureTime: `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`,
      arrivalTime: `${((hour + Math.floor(duration / 60)) % 24).toString().padStart(2, '0')}:${((minute + duration % 60) % 60).toString().padStart(2, '0')}`,
      duration: `${Math.floor(duration / 60)}h ${duration % 60}m`,
      date: date,
      price: basePrice,
      seatsAvailable: Math.floor(Math.random() * 30) + 5,
      totalSeats: 40,
      rating: (3.5 + Math.random() * 1.5).toFixed(1),
      amenities: [
        'WiFi',
        'Charging Point',
        'Water Bottle',
        'Emergency Exit'
      ].filter(() => Math.random() > 0.5),
      cancellationPolicy: 'Free cancellation up to 24 hours before departure'
    });
  }
  
  return buses.sort((a, b) => a.price - b.price);
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { from, to, date } = await req.json();
    
    console.log('Searching buses:', { from, to, date });

    if (!from || !to || !date) {
      throw new Error('Missing required parameters: from, to, date');
    }

    const buses = generateBuses(from, to, date);

    return new Response(
      JSON.stringify({ buses }),
      { 
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  } catch (error: any) {
    console.error('Error in search-buses function:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Failed to search buses' }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
