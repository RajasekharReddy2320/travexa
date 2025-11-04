import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { z } from 'https://deno.land/x/zod@v3.22.4/mod.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Security: Input validation schema
const searchSchema = z.object({
  from: z.string().trim().min(2).max(100),
  to: z.string().trim().min(2).max(100),
  date: z.string().refine((d) => !isNaN(Date.parse(d)), 'Invalid date')
});

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
    const requestData = await req.json();
    
    // Security: Validate inputs
    const validation = searchSchema.safeParse(requestData);
    if (!validation.success) {
      return new Response(
        JSON.stringify({ 
          error: 'Invalid search parameters',
          details: validation.error.issues[0].message 
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { from, to, date } = validation.data;
    
    // Security: Minimal logging
    console.log('[Bus Search]', {
      route: `${from}-${to}`,
      date,
      timestamp: new Date().toISOString()
    });

    const buses = generateBuses(from, to, date);

    return new Response(
      JSON.stringify({ buses }),
      { 
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  } catch (error: any) {
    // Security: Generic error message
    console.error('[Server Error]', {
      timestamp: new Date().toISOString()
    });
    
    return new Response(
      JSON.stringify({ error: 'Failed to search buses' }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
