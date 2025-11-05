-- Remove the duplicate booking prevention constraint entirely
-- Users should be able to book the same service multiple times
DROP INDEX IF EXISTS public.idx_prevent_duplicate_bookings;