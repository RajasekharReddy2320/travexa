import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid authentication token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const bookingData = await req.json();
    console.log('Creating booking:', bookingData);

    // Generate unique booking reference
    const bookingReference = `TRV${Date.now()}${Math.random().toString(36).substr(2, 5).toUpperCase()}`;
    
    // Generate QR code data (base64 encoded JSON)
    const qrData = {
      ref: bookingReference,
      type: bookingData.booking_type,
      from: bookingData.from_location,
      to: bookingData.to_location,
      date: bookingData.departure_date,
      time: bookingData.departure_time,
      passenger: bookingData.passenger_name,
      seat: bookingData.seat_number
    };
    const qrCode = btoa(JSON.stringify(qrData));

    // Create booking
    const { data: booking, error } = await supabaseClient
      .from('bookings')
      .insert({
        user_id: user.id,
        booking_reference: bookingReference,
        booking_type: bookingData.booking_type,
        passenger_name: bookingData.passenger_name,
        passenger_email: bookingData.passenger_email,
        passenger_phone: bookingData.passenger_phone,
        from_location: bookingData.from_location,
        to_location: bookingData.to_location,
        departure_date: bookingData.departure_date,
        departure_time: bookingData.departure_time,
        arrival_date: bookingData.arrival_date,
        arrival_time: bookingData.arrival_time,
        service_name: bookingData.service_name,
        service_number: bookingData.service_number,
        seat_number: bookingData.seat_number,
        class_type: bookingData.class_type,
        price_inr: bookingData.price_inr,
        payment_status: 'pending',
        booking_details: bookingData.details || {},
        qr_code: qrCode
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating booking:', error);
      throw error;
    }

    return new Response(
      JSON.stringify({ booking }),
      { 
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  } catch (error: any) {
    console.error('Error in create-booking function:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Failed to create booking' }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
