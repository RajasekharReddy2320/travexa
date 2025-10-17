import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { destination, startDate, endDate, budgetINR, groupSize, interests, plannerMode } = await req.json();
    
    console.log('Generating itinerary for:', { destination, startDate, endDate, budgetINR, groupSize, interests, plannerMode });

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
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
- Planner Mode: ${plannerMode}

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
      const errorText = await response.text();
      console.error('AI Gateway error:', response.status, errorText);
      
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
      
      throw new Error(`AI Gateway error: ${response.status}`);
    }

    const data = await response.json();
    console.log('AI response received');
    
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
    console.error('Error in generate-itinerary function:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Failed to generate itinerary' }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});