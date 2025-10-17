-- Create trips table for storing both AI-generated and manual trips
CREATE TABLE public.trips (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  destination TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  trip_type TEXT NOT NULL CHECK (trip_type IN ('ai', 'manual')),
  planner_mode TEXT CHECK (planner_mode IN ('comfort', 'time', 'budget')),
  budget_inr DECIMAL(12,2),
  group_size INTEGER DEFAULT 1,
  interests TEXT[],
  itinerary JSONB,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.trips ENABLE ROW LEVEL SECURITY;

-- Users can view their own trips
CREATE POLICY "Users can view own trips"
ON public.trips
FOR SELECT
USING (auth.uid() = user_id);

-- Users can create their own trips
CREATE POLICY "Users can create own trips"
ON public.trips
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can update their own trips
CREATE POLICY "Users can update own trips"
ON public.trips
FOR UPDATE
USING (auth.uid() = user_id);

-- Users can delete their own trips
CREATE POLICY "Users can delete own trips"
ON public.trips
FOR DELETE
USING (auth.uid() = user_id);

-- Add trigger for updated_at
CREATE TRIGGER update_trips_updated_at
BEFORE UPDATE ON public.trips
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Extend profiles table with additional editable fields
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS bio TEXT,
ADD COLUMN IF NOT EXISTS age INTEGER,
ADD COLUMN IF NOT EXISTS gender TEXT,
ADD COLUMN IF NOT EXISTS phone TEXT,
ADD COLUMN IF NOT EXISTS home_location TEXT,
ADD COLUMN IF NOT EXISTS languages_spoken TEXT[],
ADD COLUMN IF NOT EXISTS travel_preferences TEXT[];

-- Create messages table for messaging feature
CREATE TABLE public.messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  recipient_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on messages
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Users can view messages they sent or received
CREATE POLICY "Users can view own messages"
ON public.messages
FOR SELECT
USING (auth.uid() = sender_id OR auth.uid() = recipient_id);

-- Users can send messages
CREATE POLICY "Users can send messages"
ON public.messages
FOR INSERT
WITH CHECK (auth.uid() = sender_id);

-- Users can update messages they received (mark as read)
CREATE POLICY "Users can update received messages"
ON public.messages
FOR UPDATE
USING (auth.uid() = recipient_id);