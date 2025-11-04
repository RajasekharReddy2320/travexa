-- Security Fix: Email and Phone Exposure in Profiles
-- Create public_profiles view that excludes sensitive PII
CREATE OR REPLACE VIEW public.public_profiles AS
SELECT 
  id, full_name, avatar_url, bio, interests, budget_range, home_location,
  languages_spoken, travel_preferences, country, state, is_public, created_at, updated_at
FROM public.profiles
WHERE is_public = true;

GRANT SELECT ON public.public_profiles TO authenticated, anon;

-- Security Fix: Add booking validation constraints
DO $$ BEGIN
  ALTER TABLE public.bookings ADD CONSTRAINT booking_passenger_name_length CHECK (length(passenger_name) BETWEEN 2 AND 100);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE public.bookings ADD CONSTRAINT booking_passenger_email_length CHECK (length(passenger_email) BETWEEN 5 AND 255);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE public.bookings ADD CONSTRAINT booking_passenger_phone_length CHECK (length(passenger_phone) BETWEEN 10 AND 15);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE public.bookings ADD CONSTRAINT booking_locations_length CHECK (length(from_location) BETWEEN 2 AND 100 AND length(to_location) BETWEEN 2 AND 100);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE public.bookings ADD CONSTRAINT booking_price_positive CHECK (price_inr > 0 AND price_inr <= 1000000);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Security Fix: Delete policies
DROP POLICY IF EXISTS "Admins can delete bookings" ON public.bookings;
CREATE POLICY "Admins can delete bookings" ON public.bookings FOR DELETE
USING (public.has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "Users can delete pending bookings" ON public.bookings;
CREATE POLICY "Users can delete pending bookings" ON public.bookings FOR DELETE
USING (auth.uid() = user_id AND payment_status = 'pending' AND created_at > NOW() - INTERVAL '1 hour');

-- Security Fix: Message validation
DO $$ BEGIN
  ALTER TABLE public.messages ADD CONSTRAINT message_content_length CHECK (length(content) BETWEEN 1 AND 2000);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Security Fix: Prevent duplicate bookings
DROP INDEX IF EXISTS idx_prevent_duplicate_bookings;
CREATE UNIQUE INDEX idx_prevent_duplicate_bookings
ON public.bookings(user_id, service_number, departure_date)
WHERE status NOT IN ('cancelled');

-- Security Fix: Rate limiting for bookings
CREATE OR REPLACE FUNCTION public.check_booking_rate_limit()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  IF (SELECT COUNT(*) FROM public.bookings WHERE user_id = NEW.user_id AND created_at > NOW() - INTERVAL '1 hour') >= 5 THEN
    RAISE EXCEPTION 'Rate limit exceeded. Maximum 5 bookings per hour.';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS enforce_booking_rate_limit ON public.bookings;
CREATE TRIGGER enforce_booking_rate_limit BEFORE INSERT ON public.bookings
FOR EACH ROW EXECUTE FUNCTION public.check_booking_rate_limit();

-- Security Fix: Authenticated ticket verification
DROP POLICY IF EXISTS "Anyone can verify tickets" ON public.ticket_verifications;
CREATE POLICY "Only authenticated users can verify tickets" ON public.ticket_verifications FOR INSERT
WITH CHECK (
  auth.uid() IS NOT NULL AND
  EXISTS (SELECT 1 FROM public.bookings WHERE bookings.id = ticket_verifications.booking_id AND bookings.status = 'confirmed' AND bookings.payment_status = 'completed')
);

DROP POLICY IF EXISTS "Rate limit ticket verifications" ON public.ticket_verifications;
CREATE POLICY "Rate limit ticket verifications" ON public.ticket_verifications FOR INSERT
WITH CHECK (
  NOT EXISTS (SELECT 1 FROM public.ticket_verifications tv WHERE tv.booking_id = ticket_verifications.booking_id AND tv.verified_at > NOW() - INTERVAL '1 hour')
);
