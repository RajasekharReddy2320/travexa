-- Add 'hotel' to the allowed booking_type values
ALTER TABLE public.bookings 
DROP CONSTRAINT IF EXISTS bookings_booking_type_check;

ALTER TABLE public.bookings
ADD CONSTRAINT bookings_booking_type_check 
CHECK (booking_type = ANY (ARRAY['flight'::text, 'train'::text, 'bus'::text, 'hotel'::text, 'multi-segment'::text]));