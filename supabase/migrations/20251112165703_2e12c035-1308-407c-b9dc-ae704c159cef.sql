-- Add itinerary field to posts table for sharing travel plans
ALTER TABLE public.posts 
ADD COLUMN itinerary jsonb DEFAULT NULL;

COMMENT ON COLUMN public.posts.itinerary IS 'Optional travel itinerary data including destination, dates, transportation, activities, and budget. Users can book these itineraries directly.';