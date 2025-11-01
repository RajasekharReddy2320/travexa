-- Add profile privacy setting
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT true;

-- Create user connections table
CREATE TABLE IF NOT EXISTS public.user_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  requester_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  addressee_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT NOT NULL CHECK (status IN ('pending', 'accepted', 'rejected')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(requester_id, addressee_id),
  CHECK (requester_id != addressee_id)
);

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_user_connections_requester ON public.user_connections(requester_id, status);
CREATE INDEX IF NOT EXISTS idx_user_connections_addressee ON public.user_connections(addressee_id, status);
CREATE INDEX IF NOT EXISTS idx_user_connections_both ON public.user_connections(requester_id, addressee_id);

-- Enable RLS
ALTER TABLE public.user_connections ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_connections
CREATE POLICY "Users can view their own connections"
ON public.user_connections
FOR SELECT
USING (auth.uid() = requester_id OR auth.uid() = addressee_id);

CREATE POLICY "Users can create connection requests"
ON public.user_connections
FOR INSERT
WITH CHECK (auth.uid() = requester_id);

CREATE POLICY "Users can update received connection requests"
ON public.user_connections
FOR UPDATE
USING (auth.uid() = addressee_id)
WITH CHECK (auth.uid() = addressee_id);

CREATE POLICY "Users can delete their own connection requests"
ON public.user_connections
FOR DELETE
USING (auth.uid() = requester_id OR auth.uid() = addressee_id);

-- Update profiles RLS policy to respect privacy settings
DROP POLICY IF EXISTS "Anyone can view profiles" ON public.profiles;

CREATE POLICY "Users can view public profiles"
ON public.profiles
FOR SELECT
USING (
  is_public = true 
  OR auth.uid() = id 
  OR EXISTS (
    SELECT 1 FROM public.user_connections
    WHERE status = 'accepted'
    AND (
      (requester_id = auth.uid() AND addressee_id = profiles.id)
      OR (addressee_id = auth.uid() AND requester_id = profiles.id)
    )
  )
);

-- Update messages RLS policy to respect connections for private profiles
DROP POLICY IF EXISTS "Users can send messages" ON public.messages;

CREATE POLICY "Users can send messages"
ON public.messages
FOR INSERT
WITH CHECK (
  auth.uid() = sender_id
  AND (
    -- Can message if recipient has public profile
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = recipient_id AND is_public = true
    )
    -- Or if both users are connected
    OR EXISTS (
      SELECT 1 FROM public.user_connections
      WHERE status = 'accepted'
      AND (
        (requester_id = auth.uid() AND addressee_id = recipient_id)
        OR (addressee_id = auth.uid() AND requester_id = recipient_id)
      )
    )
  )
);

-- Function to check if two users are connected
CREATE OR REPLACE FUNCTION public.are_users_connected(user1_id UUID, user2_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_connections
    WHERE status = 'accepted'
    AND (
      (requester_id = user1_id AND addressee_id = user2_id)
      OR (addressee_id = user1_id AND requester_id = user2_id)
    )
  )
$$;

-- Function to get connection status between two users
CREATE OR REPLACE FUNCTION public.get_connection_status(user1_id UUID, user2_id UUID)
RETURNS TEXT
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(
    (
      SELECT 
        CASE 
          WHEN status = 'accepted' THEN 'connected'
          WHEN requester_id = user1_id THEN 'pending_sent'
          ELSE 'pending_received'
        END
      FROM public.user_connections
      WHERE (
        (requester_id = user1_id AND addressee_id = user2_id)
        OR (addressee_id = user1_id AND requester_id = user2_id)
      )
      AND status IN ('pending', 'accepted')
      LIMIT 1
    ),
    'none'
  )
$$;

-- Trigger for updated_at
CREATE TRIGGER update_user_connections_updated_at
BEFORE UPDATE ON public.user_connections
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();