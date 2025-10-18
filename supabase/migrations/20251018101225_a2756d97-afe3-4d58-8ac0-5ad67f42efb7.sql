-- Add social features to trips table
ALTER TABLE public.trips
ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS likes_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS image_url TEXT;

-- Add DOB and location fields to profiles
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS date_of_birth DATE,
ADD COLUMN IF NOT EXISTS country TEXT,
ADD COLUMN IF NOT EXISTS state TEXT;

-- Create trip_likes table
CREATE TABLE IF NOT EXISTS public.trip_likes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  trip_id UUID NOT NULL REFERENCES public.trips(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(trip_id, user_id)
);

ALTER TABLE public.trip_likes ENABLE ROW LEVEL SECURITY;

-- Users can view all likes
CREATE POLICY "Anyone can view trip likes"
ON public.trip_likes
FOR SELECT
USING (true);

-- Users can like trips
CREATE POLICY "Users can like trips"
ON public.trip_likes
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can unlike trips
CREATE POLICY "Users can unlike trips"
ON public.trip_likes
FOR DELETE
USING (auth.uid() = user_id);

-- Create bucket_list table (saved trips)
CREATE TABLE IF NOT EXISTS public.bucket_list (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  trip_id UUID NOT NULL REFERENCES public.trips(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(trip_id, user_id)
);

ALTER TABLE public.bucket_list ENABLE ROW LEVEL SECURITY;

-- Users can view their own bucket list
CREATE POLICY "Users can view own bucket list"
ON public.bucket_list
FOR SELECT
USING (auth.uid() = user_id);

-- Users can add to bucket list
CREATE POLICY "Users can add to bucket list"
ON public.bucket_list
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can remove from bucket list
CREATE POLICY "Users can remove from bucket list"
ON public.bucket_list
FOR DELETE
USING (auth.uid() = user_id);

-- Create user_follows table
CREATE TABLE IF NOT EXISTS public.user_follows (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  follower_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  following_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(follower_id, following_id),
  CHECK (follower_id != following_id)
);

ALTER TABLE public.user_follows ENABLE ROW LEVEL SECURITY;

-- Anyone can view follows
CREATE POLICY "Anyone can view follows"
ON public.user_follows
FOR SELECT
USING (true);

-- Users can follow others
CREATE POLICY "Users can follow others"
ON public.user_follows
FOR INSERT
WITH CHECK (auth.uid() = follower_id);

-- Users can unfollow
CREATE POLICY "Users can unfollow"
ON public.user_follows
FOR DELETE
USING (auth.uid() = follower_id);

-- Update trips RLS to allow viewing public trips
DROP POLICY IF EXISTS "Users can view own trips" ON public.trips;
CREATE POLICY "Users can view own and public trips"
ON public.trips
FOR SELECT
USING (is_public = true OR auth.uid() = user_id);

-- Update profiles RLS to allow anyone to view basic profile info
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
CREATE POLICY "Anyone can view profiles"
ON public.profiles
FOR SELECT
USING (true);

-- Still allow users to update only their own profile
CREATE POLICY "Users can update own profile" 
ON public.profiles
FOR UPDATE
USING (auth.uid() = id);

-- Still allow users to insert their own profile
CREATE POLICY "Users can insert own profile"
ON public.profiles
FOR INSERT
WITH CHECK (auth.uid() = id);

-- Enable realtime for messages
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'messages'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
  END IF;
END $$;

-- Enable realtime for trip_likes
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'trip_likes'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.trip_likes;
  END IF;
END $$;