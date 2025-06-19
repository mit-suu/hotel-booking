-- Script to remove latitude and longitude columns from hotels table
-- Run this script manually on your database

-- Remove latitude column
ALTER TABLE hotels DROP COLUMN IF EXISTS latitude;

-- Remove longitude column  
ALTER TABLE hotels DROP COLUMN IF EXISTS longitude;

-- Verify the columns have been removed
-- SELECT column_name FROM information_schema.columns WHERE table_name = 'hotels' AND table_schema = 'your_database_name'; 
 