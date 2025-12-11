-- Migration script: Change is_backup to can_work_alone
-- Run this on Neon database console or via psql

-- Add new column
ALTER TABLE employees ADD COLUMN IF NOT EXISTS can_work_alone BOOLEAN DEFAULT FALSE;

-- Drop old column if exists
ALTER TABLE employees DROP COLUMN IF EXISTS is_backup;

-- Optional: Update existing data (mark first employee as qualified)
-- UPDATE employees SET can_work_alone = TRUE WHERE id = '1';
