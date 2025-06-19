-- Add cancellation related fields to bookings table
ALTER TABLE bookings ADD COLUMN cancellation_reason TEXT;
ALTER TABLE bookings ADD COLUMN refund_amount DECIMAL(10,2); 