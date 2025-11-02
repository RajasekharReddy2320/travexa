import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Fake train data generator
const trainNames = [
  'Rajdhani Express', 'Shatabdi Express', 'Duronto Express', 'Garib Rath',
  'Humsafar Express', 'Tejas Express', 'Vande Bharat', 'Double Decker'
];

function generateTrains(from: string, to: string, date: string) {
  const trains = [];
  const numTrains = 4 + Math.floor(Math.random() * 6);
  
  for (let i = 0; i < numTrains; i++) {
    const name = trainNames[Math.floor(Math.random() * trainNames.length)];
    const hour = 5 + Math.floor(Math.random() * 20);
    const minute = Math.floor(Math.random() * 60);
    const duration = 180 + Math.floor(Math.random() * 480);
    const basePrice = 500 + Math.floor(Math.random() * 2500);
    
    trains.push({
      id: `TR${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
      name,
      trainNumber: `${Math.floor(Math.random() * 90000) + 10000}`,
      from: from,
      to: to,
      departureTime: `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`,
      arrivalTime: `${((hour + Math.floor(duration / 60)) % 24).toString().padStart(2, '0')}:${((minute + duration % 60) % 60).toString().padStart(2, '0')}`,
      duration: `${Math.floor(duration / 60)}h ${duration % 60}m`,
      date: date,
      classes: {
        'SL': { price: basePrice, available: Math.floor(Math.random() * 100) + 20 },
        '3A': { price: Math.floor(basePrice * 1.5), available: Math.floor(Math.random() * 80) + 10 },
        '2A': { price: Math.floor(basePrice * 2), available: Math.floor(Math.random() * 60) + 5 },
        '1A': { price: Math.floor(basePrice * 3), available: Math.floor(Math.random() * 40) + 5 }
      },
      runsOn: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
    });
  }
  
  return trains.sort((a, b) => a.classes['SL'].price - b.classes['SL'].price);
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { from, to, date } = await req.json();
    
    console.log('Searching trains:', { from, to, date });

    if (!from || !to || !date) {
      throw new Error('Missing required parameters: from, to, date');
    }

    const trains = generateTrains(from, to, date);

    return new Response(
      JSON.stringify({ trains }),
      { 
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  } catch (error: any) {
    console.error('Error in search-trains function:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Failed to search trains' }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
