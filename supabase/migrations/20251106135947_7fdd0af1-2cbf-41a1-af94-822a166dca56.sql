-- Create trip_shares table for sharing trips with others
CREATE TABLE public.trip_shares (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  trip_group_id UUID NOT NULL,
  owner_id UUID NOT NULL,
  shared_with_email TEXT NOT NULL,
  shared_with_user_id UUID,
  access_level TEXT NOT NULL CHECK (access_level IN ('view', 'join')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.trip_shares ENABLE ROW LEVEL SECURITY;

-- Policies for trip owners
CREATE POLICY "Trip owners can create shares"
ON public.trip_shares
FOR INSERT
WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Trip owners can view their shares"
ON public.trip_shares
FOR SELECT
USING (auth.uid() = owner_id);

CREATE POLICY "Trip owners can delete shares"
ON public.trip_shares
FOR DELETE
USING (auth.uid() = owner_id);

-- Policies for invited users
CREATE POLICY "Invited users can view shares"
ON public.trip_shares
FOR SELECT
USING (
  (shared_with_user_id = auth.uid()) OR
  (shared_with_email = (SELECT email FROM profiles WHERE id = auth.uid()))
);

CREATE POLICY "Invited users can update share status"
ON public.trip_shares
FOR UPDATE
USING (
  (shared_with_user_id = auth.uid()) OR
  (shared_with_email = (SELECT email FROM profiles WHERE id = auth.uid()))
);

-- Create trigger for updated_at
CREATE TRIGGER update_trip_shares_updated_at
BEFORE UPDATE ON public.trip_shares
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Update bookings RLS to allow viewing shared trips
CREATE POLICY "Users can view shared trip bookings"
ON public.bookings
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.trip_shares
    WHERE trip_shares.trip_group_id = bookings.trip_group_id
    AND trip_shares.status = 'accepted'
    AND (
      trip_shares.shared_with_user_id = auth.uid() OR
      trip_shares.shared_with_email = (SELECT email FROM profiles WHERE id = auth.uid())
    )
  )
);