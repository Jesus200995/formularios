-- Add public_code column to forms table
ALTER TABLE forms 
ADD COLUMN public_code VARCHAR(20) UNIQUE;

CREATE INDEX idx_forms_public_code ON forms(public_code);

-- Generate unique codes for existing forms
UPDATE forms 
SET public_code = 
  LOWER(
    CONCAT(
      SUBSTRING(MD5(RANDOM()::text || id::text), 1, 4),
      SUBSTRING(MD5(RANDOM()::text || title), 1, 4)
    )
  )
WHERE public_code IS NULL;
