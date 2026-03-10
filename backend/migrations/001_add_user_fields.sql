-- Migration: Add first_name, last_name, curp to users table
-- Date: 2026-03-10

-- Add new columns to users table
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS first_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS last_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS curp VARCHAR(18);

-- Create unique index for CURP (if not exists)
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_curp ON users(curp) WHERE curp IS NOT NULL;

-- Update full_name for existing users (if needed)
UPDATE users 
SET full_name = COALESCE(first_name || ' ' || last_name, full_name, email)
WHERE full_name IS NULL OR full_name = '';
