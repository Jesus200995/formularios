-- Add app_user_id column to submissions table
-- This links submissions to mobile app users (app_users table)

ALTER TABLE submissions 
ADD COLUMN IF NOT EXISTS app_user_id INTEGER;

-- Add foreign key constraint
ALTER TABLE submissions 
ADD CONSTRAINT fk_submissions_app_user 
FOREIGN KEY (app_user_id) 
REFERENCES app_users(id) 
ON DELETE SET NULL;

-- Add index for better query performance
CREATE INDEX IF NOT EXISTS idx_submissions_app_user_id 
ON submissions(app_user_id);

-- Comments
COMMENT ON COLUMN submissions.app_user_id IS 'ID del usuario de la app móvil que envió esta respuesta';
