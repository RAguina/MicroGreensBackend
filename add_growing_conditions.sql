-- Add growing condition fields to Plantings table
-- Execute this SQL on production database

ALTER TABLE "Plantings"
ADD COLUMN "substrate" VARCHAR(100),
ADD COLUMN "irrigationMl" INTEGER,
ADD COLUMN "soakingHours" INTEGER;

-- Verify columns were added
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'Plantings'
AND column_name IN ('substrate', 'irrigationMl', 'soakingHours');