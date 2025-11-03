-- Update booking_type constraint to allow multi-segment
ALTER TABLE bookings DROP CONSTRAINT IF EXISTS bookings_booking_type_check;

ALTER TABLE bookings ADD CONSTRAINT bookings_booking_type_check 
CHECK (booking_type IN ('flight', 'train', 'bus', 'multi-segment'));

-- Add cancellation fields to bookings
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS cancelled_at timestamp with time zone;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS cancellation_reason text;

-- Add cancellation fields to trip_segments
ALTER TABLE trip_segments ADD COLUMN IF NOT EXISTS cancelled_at timestamp with time zone;
ALTER TABLE trip_segments ADD COLUMN IF NOT EXISTS cancellation_reason text;