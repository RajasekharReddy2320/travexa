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
    const { destination, startDate, endDate, budget, interests } = await req.json();
    console.log('Generating itinerary for:', { destination, startDate, endDate, budget, interests });

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const prompt = `Create a detailed travel itinerary for the following trip:
- Destination: ${destination}
- Dates: ${startDate} to ${endDate}
- Budget: ${budget}
- Interests: ${interests.join(', ')}

Please provide a day-by-day itinerary with:
1. Morning, afternoon, and evening activities
2. Recommended restaurants for each meal
3. Estimated costs for each activity
4. Transportation tips between locations
5. Cultural tips and must-see attractions

Format the response as a structured JSON with this schema:
{
  "days": [
    {
      "day": 1,
      "date": "YYYY-MM-DD",
      "activities": [
        {
          "time": "Morning/Afternoon/Evening",
          "title": "Activity name",
          "description": "Detailed description",
          "cost": "Estimated cost",
          "location": "Specific location",
          "duration": "Duration in hours"
        }
      ],
      "meals": [
        {
          "type": "Breakfast/Lunch/Dinner",
          "restaurant": "Restaurant name",
          "cuisine": "Type of cuisine",
          "cost": "Estimated cost"
        }
      ]
    }
  ],
  "totalEstimatedCost": "Total cost for the trip",
  "tips": ["Cultural tip 1", "Cultural tip 2", "..."]
}`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { 
            role: 'system', 
            content: 'You are an expert travel planner. Provide detailed, practical itineraries in valid JSON format. Always respond with properly formatted JSON only, no markdown or additional text.'
          },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
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
