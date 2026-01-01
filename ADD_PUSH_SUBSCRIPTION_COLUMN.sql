-- Add push_subscription column to profiles table to store VAPID subscription objects
ALTER TABLE profiles ADD COLUMN push_subscription jsonb;
