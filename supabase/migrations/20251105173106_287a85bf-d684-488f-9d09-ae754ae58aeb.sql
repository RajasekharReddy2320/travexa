-- Drop the old unique index
DROP INDEX IF EXISTS public.idx_prevent_duplicate_bookings;

-- Create a new unique index that includes booking_type
CREATE UNIQUE INDEX idx_prevent_duplicate_bookings 
ON public.bookings (user_id, booking_type, service_number, departure_date) 
WHERE status <> 'cancelled';