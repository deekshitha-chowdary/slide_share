-- Fix OTP expiry to recommended threshold (1 hour = 3600 seconds)
UPDATE auth.config 
SET otp_expiry = 3600 
WHERE id = 'default';