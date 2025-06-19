-- Remove review status fields (is_verified and is_approved)
-- These fields are no longer needed as we're removing the review moderation system

ALTER TABLE reviews DROP COLUMN IF EXISTS is_verified;
ALTER TABLE reviews DROP COLUMN IF EXISTS is_approved; 