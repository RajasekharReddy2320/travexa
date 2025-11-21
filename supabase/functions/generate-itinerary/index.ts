import "https://deno.land/x/xhr@0.1.0/mod.ts";
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
  plannerMode: z.enum(['comfort', 'time', 'budget']).optional(),
  aiModel: z.enum(['gemini', 'gpt5', 'gpt5-mini']).optional(),
  regenerateDay: z.number().optional(),
  existingItinerary: z.any().optional()
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

    const { destination, startDate, endDate, budgetINR, groupSize, interests, plannerMode, aiModel = 'gemini', regenerateDay, existingItinerary } = validation.data;
    
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

    // Check for required API keys based on model selection
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
    
    if (aiModel === 'gemini' && !LOVABLE_API_KEY) {
      console.error('[Config Error] LOVABLE_API_KEY not configured');
      return new Response(
        JSON.stringify({ error: 'Lovable AI not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    if ((aiModel === 'gpt5' || aiModel === 'gpt5-mini') && !OPENAI_API_KEY) {
      console.error('[Config Error] OPENAI_API_KEY not configured');
      return new Response(
        JSON.stringify({ error: 'OpenAI API key not configured' }),
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
    
    systemPrompt += " Always provide costs in INR (Indian Rupees). CRITICAL: Return ONLY a valid JSON object (no markdown, no code blocks) with this EXACT structure: {\"overview\": \"string description\", \"dailyPlan\": [{\"day\": 1, \"activities\": \"comma-separated string of activities\"}], \"estimatedCostINR\": number, \"tips\": \"string of tips\"}. The activities field MUST be a plain string, not an array or object.";

    let prompt;
    if (regenerateDay && existingItinerary) {
      prompt = `Regenerate ONLY Day ${regenerateDay} of this travel itinerary:
- Destination: ${destination}
- Dates: ${startDate} to ${endDate}
- Budget: ${budgetINR ? `₹${budgetINR}` : 'Flexible'}
- Group Size: ${groupSize} ${groupSize === 1 ? 'person' : 'people'}
- Interests: ${interests.join(', ')}
- Planner Mode: ${plannerMode || 'balanced'}

Current Day ${regenerateDay} activities: ${existingItinerary.dailyPlan?.find((d: any) => d.day === regenerateDay)?.activities || 'None'}

Provide a COMPLETE new itinerary with all days, but focus on making Day ${regenerateDay} different and more interesting. Return ONLY valid JSON with structure: {\"overview\": \"string\", \"dailyPlan\": [{\"day\": number, \"activities\": \"string\"}], \"estimatedCostINR\": number, \"tips\": \"string\"}. No markdown, no code blocks.`;
    } else {
      prompt = `Create a detailed travel itinerary for:
- Destination: ${destination}
- Dates: ${startDate} to ${endDate}
- Budget: ${budgetINR ? `₹${budgetINR}` : 'Flexible'}
- Group Size: ${groupSize} ${groupSize === 1 ? 'person' : 'people'}
- Interests: ${interests.join(', ')}
- Planner Mode: ${plannerMode || 'balanced'}

Provide a day-by-day breakdown with activities, estimated costs in INR, and travel tips. Return ONLY valid JSON with this EXACT structure: {\"overview\": \"string description\", \"dailyPlan\": [{\"day\": 1, \"activities\": \"Morning: activity 1, Afternoon: activity 2, Evening: activity 3\"}], \"estimatedCostINR\": number, \"tips\": \"string tips\"}. Activities MUST be a descriptive string, not an array or object. No markdown, no code blocks.`;
    }

    let response;
    let apiUrl;
    let headers;
    let requestBody: any;

    if (aiModel === 'gemini') {
      apiUrl = 'https://ai.gateway.lovable.dev/v1/chat/completions';
      headers = {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      };
      requestBody = {
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: prompt }
        ],
      };
    } else {
      // OpenAI GPT-5 models
      apiUrl = 'https://api.openai.com/v1/chat/completions';
      headers = {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      };
      requestBody = {
        model: aiModel === 'gpt5' ? 'gpt-5-2025-08-07' : 'gpt-5-mini-2025-08-07',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: prompt }
        ],
        max_completion_tokens: 4000,
      };
    }

    response = await fetch(apiUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[AI API Error]', {
        status: response.status,
        model: aiModel,
        error: errorText,
        timestamp: new Date().toISOString()
      });
      
      if (response.status === 429) {
        const serviceName = aiModel === 'gemini' ? 'Lovable AI' : 'OpenAI';
        
        // Check if it's an OpenAI quota issue
        const isQuotaIssue = errorText.includes('insufficient_quota') || errorText.includes('exceeded your current quota');
        
        if (isQuotaIssue && aiModel !== 'gemini') {
          return new Response(
            JSON.stringify({ 
              error: `OpenAI account has no credits. Please use Google Gemini instead (free) or add credits to your OpenAI account.`,
              suggestModel: 'gemini'
            }),
            { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        
        const suggestion = aiModel !== 'gemini' 
          ? ' Try using Google Gemini model instead (free), or wait a few minutes before retrying.'
          : ' Please wait a few minutes before trying again.';
        
        return new Response(
          JSON.stringify({ 
            error: `${serviceName} rate limit exceeded.${suggestion}`,
            suggestModel: aiModel !== 'gemini' ? 'gemini' : undefined
          }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'AI credits exhausted. Please add credits to continue.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      if (response.status === 401) {
        const serviceName = aiModel === 'gemini' ? 'Lovable AI' : 'OpenAI';
        return new Response(
          JSON.stringify({ 
            error: `${serviceName} authentication failed. Please check your API key configuration.`,
            suggestModel: aiModel !== 'gemini' ? 'gemini' : undefined
          }),
          { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      return new Response(
        JSON.stringify({ 
          error: `Failed to generate itinerary. Please try again or switch to a different AI model.`,
          details: errorText,
          suggestModel: aiModel !== 'gemini' ? 'gemini' : undefined
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const data = await response.json();
    console.log('[AI Response] Itinerary generated successfully');
    
    let itinerary = data.choices[0].message.content;
    
    // Clean up the response - remove any markdown formatting
    itinerary = itinerary.trim();
    if (itinerary.includes('```json')) {
      itinerary = itinerary.replace(/```json\n?/g, '').replace(/```\n?/g, '');
    }
    if (itinerary.includes('```')) {
      itinerary = itinerary.replace(/```\n?/g, '');
    }
    
    // Remove any leading/trailing whitespace and newlines
    itinerary = itinerary.trim();
    
    // Parse to validate JSON
    const parsedItinerary = JSON.parse(itinerary);
    
    // Validate the structure
    if (!parsedItinerary.dailyPlan || !Array.isArray(parsedItinerary.dailyPlan)) {
      throw new Error('Invalid itinerary format: missing dailyPlan array');
    }
    
    // Ensure activities are strings
    parsedItinerary.dailyPlan = parsedItinerary.dailyPlan.map((day: any, index: number) => ({
      day: typeof day.day === 'number' ? day.day : index + 1,
      activities: typeof day.activities === 'string' 
        ? day.activities 
        : Array.isArray(day.activities)
        ? day.activities.join(', ')
        : JSON.stringify(day.activities)
    }));
    
    console.log('[Validation] Itinerary structure validated and normalized');

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
