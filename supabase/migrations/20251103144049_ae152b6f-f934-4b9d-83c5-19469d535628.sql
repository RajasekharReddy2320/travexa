-- Create table for multi-segment trips
CREATE TABLE trip_segments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_group_id uuid NOT NULL,
  user_id uuid NOT NULL,
  segment_order integer NOT NULL,
  booking_type text NOT NULL,
  service_name text NOT NULL,
  service_number text NOT NULL,
  from_location text NOT NULL,
  to_location text NOT NULL,
  departure_date date NOT NULL,
  departure_time time NOT NULL,
  arrival_time time NOT NULL,
  passenger_name text NOT NULL,
  passenger_email text NOT NULL,
  passenger_phone text NOT NULL,
  seat_number text,
  class_type text,
  price_inr numeric NOT NULL,
  status text NOT NULL DEFAULT 'confirmed',
  payment_status text NOT NULL DEFAULT 'completed',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE trip_segments ENABLE ROW LEVEL SECURITY;

-- RLS policies for trip_segments
CREATE POLICY "Users can view own trip segments"
ON trip_segments
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create own trip segments"
ON trip_segments
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own trip segments"
ON trip_segments
FOR UPDATE
USING (auth.uid() = user_id);

-- Add trip_group_id to bookings table to link single and multi-segment trips
ALTER TABLE bookings ADD COLUMN trip_group_id uuid;

-- Index for faster queries
CREATE INDEX idx_trip_segments_group ON trip_segments(trip_group_id, segment_order);
CREATE INDEX idx_trip_segments_user ON trip_segments(user_id);
CREATE INDEX idx_bookings_trip_group ON bookings(trip_group_id);