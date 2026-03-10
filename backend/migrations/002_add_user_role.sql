-- Migration: Add role column to users table
-- Date: 2026-03-10

-- Create enum type for user roles
CREATE TYPE user_role AS ENUM ('user', 'admin');

-- Add role column to users table
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS role user_role DEFAULT 'user';

-- Update existing users: set role based on is_admin
UPDATE users 
SET role = CASE 
    WHEN is_admin = true THEN 'admin'::user_role
    ELSE 'user'::user_role
END;

-- Make role column NOT NULL after setting defaults
ALTER TABLE users 
ALTER COLUMN role SET NOT NULL;
