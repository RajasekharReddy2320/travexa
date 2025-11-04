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
  date: z.string().refine((d) => !isNaN(Date.parse(d)), 'Invalid date'),
  passengers: z.number().int().min(1).max(9).default(1)
});

// Fake flight data generator
const airlines = ['Air India', 'IndiGo', 'SpiceJet', 'Vistara', 'Go First', 'AirAsia India'];
const airports: Record<string, string> = {
  'Delhi': 'DEL',
  'Mumbai': 'BOM',
  'Bangalore': 'BLR',
  'Kolkata': 'CCU',
  'Chennai': 'MAA',
  'Hyderabad': 'HYD',
  'Pune': 'PNQ',
  'Ahmedabad': 'AMD',
  'Goa': 'GOI',
  'Jaipur': 'JAI'
};

function generateFlights(from: string, to: string, date: string) {
  const flights = [];
  const numFlights = 5 + Math.floor(Math.random() * 5);
  
  for (let i = 0; i < numFlights; i++) {
    const airline = airlines[Math.floor(Math.random() * airlines.length)];
    const hour = 6 + Math.floor(Math.random() * 16);
    const minute = Math.floor(Math.random() * 60);
    const duration = 60 + Math.floor(Math.random() * 180);
    const basePrice = 2500 + Math.floor(Math.random() * 8000);
    
    flights.push({
      id: `FL${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
      airline,
      flightNumber: `${airline.split(' ')[0].substring(0, 2).toUpperCase()}${Math.floor(Math.random() * 9000) + 1000}`,
      from: from,
      fromCode: airports[from] || 'XXX',
      to: to,
      toCode: airports[to] || 'YYY',
      departureTime: `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`,
      arrivalTime: `${((hour + Math.floor(duration / 60)) % 24).toString().padStart(2, '0')}:${((minute + duration % 60) % 60).toString().padStart(2, '0')}`,
      duration: `${Math.floor(duration / 60)}h ${duration % 60}m`,
      date: date,
      price: basePrice,
      seatsAvailable: Math.floor(Math.random() * 50) + 10,
      class: ['Economy', 'Business'],
      stops: Math.random() > 0.7 ? 1 : 0
    });
  }
  
  return flights.sort((a, b) => a.price - b.price);
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

    const { from, to, date, passengers } = validation.data;
    
    // Security: Minimal logging
    console.log('[Flight Search]', {
      route: `${from}-${to}`,
      date,
      timestamp: new Date().toISOString()
    });

    const flights = generateFlights(from, to, date);

    return new Response(
      JSON.stringify({ flights }),
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
      JSON.stringify({ error: 'Failed to search flights' }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
