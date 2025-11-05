-- Drop the rate limit trigger first
DROP TRIGGER IF EXISTS enforce_booking_rate_limit ON public.bookings;

-- Then drop the rate limit function
DROP FUNCTION IF EXISTS public.check_booking_rate_limit();