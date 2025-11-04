import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { z } from 'https://deno.land/x/zod@v3.22.4/mod.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Security: Input validation schema
const itineraryRequestSchema = z.object({
  destination: z.string().trim().min(2).max(100),
  startDate: z.string().refine((d) => !isNaN(Date.parse(d)), 'Invalid start date'),
  endDate: z.string().refine((d) => !isNaN(Date.parse(d)), 'Invalid end date'),
  budgetINR: z.number().positive().max(10000000).optional().nullable(),
  groupSize: z.number().int().min(1).max(50),
  interests: z.array(z.string().max(50)).max(20),
  plannerMode: z.enum(['comfort', 'time', 'budget']).optional()
});

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const requestData = await req.json();
    
    // Security: Validate inputs
    const validation = itineraryRequestSchema.safeParse(requestData);
    if (!validation.success) {
      return new Response(
        JSON.stringify({ 
          error: 'Invalid request',
          details: validation.error.issues[0].message 
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { destination, startDate, endDate, budgetINR, groupSize, interests, plannerMode } = validation.data;
    
    // Security: Validate date logic
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (end <= start) {
      return new Response(
        JSON.stringify({ error: 'End date must be after start date' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const tripDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    if (tripDays > 60) {
      return new Response(
        JSON.stringify({ error: 'Trip duration cannot exceed 60 days' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Security: Minimal logging without PII
    console.log('[Itinerary Request]', {
      destination,
      duration_days: tripDays,
      timestamp: new Date().toISOString()
    });

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      console.error('[Config Error] LOVABLE_API_KEY not configured');
      return new Response(
        JSON.stringify({ error: 'Service configuration error' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Construct system prompt based on planner mode
    let systemPrompt = "You are a helpful travel planning assistant that creates detailed itineraries.";
    
    if (plannerMode === 'comfort') {
      systemPrompt += " Focus on premium experiences, relaxation, stress-free travel, luxury accommodations, and comfortable transportation. Prioritize quality over quantity.";
    } else if (plannerMode === 'time') {
      systemPrompt += " Optimize for efficient scheduling, short travel times between locations, and maximum experiences per day. Create a packed but realistic itinerary.";
    } else if (plannerMode === 'budget') {
      systemPrompt += " Focus on cost-effective options, budget accommodations, free or cheap activities, local transportation, and money-saving tips.";
    }
    
    systemPrompt += " Always provide costs in INR (Indian Rupees). Format your response as JSON with: overview, dailyPlan (array of {day, activities}), estimatedCostINR, and tips.";

    const prompt = `Create a detailed travel itinerary for:
- Destination: ${destination}
- Dates: ${startDate} to ${endDate}
- Budget: ${budgetINR ? `₹${budgetINR}` : 'Flexible'}
- Group Size: ${groupSize} ${groupSize === 1 ? 'person' : 'people'}
- Interests: ${interests.join(', ')}
- Planner Mode: ${plannerMode || 'balanced'}

Provide a day-by-day breakdown with activities, estimated costs in INR, and travel tips. Format as valid JSON only.`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: prompt }
        ],
      }),
    });

    if (!response.ok) {
      // Security: Log error code only, not full response
      console.error('[AI Gateway Error]', {
        status: response.status,
        timestamp: new Date().toISOString()
      });
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'AI credits exhausted. Please add credits to continue.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      return new Response(
        JSON.stringify({ error: 'Failed to generate itinerary' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const data = await response.json();
    console.log('[AI Response] Itinerary generated successfully');
    
    let itinerary = data.choices[0].message.content;
    
    // Clean up the response if it contains markdown code blocks
    if (itinerary.includes('```json')) {
      itinerary = itinerary.replace(/```json\n?/g, '').replace(/```\n?/g, '');
    }
    
    // Parse to validate JSON
    const parsedItinerary = JSON.parse(itinerary);

    return new Response(
      JSON.stringify({ itinerary: parsedItinerary }),
      { 
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  } catch (error: any) {
    // Security: Generic error message to client
    console.error('[Server Error]', {
      message: error.message,
      timestamp: new Date().toISOString()
    });
    
    return new Response(
      JSON.stringify({ error: 'Failed to generate itinerary' }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
