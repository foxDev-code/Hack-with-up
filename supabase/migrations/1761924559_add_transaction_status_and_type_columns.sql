-- Migration: add_transaction_status_and_type_columns
-- Created at: 1761924559


-- Add status column to transactions table
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending';

-- Add type column (alias for transaction_type for consistency)
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS type TEXT;

-- Update existing records
UPDATE transactions SET status = 'completed' WHERE status IS NULL;
UPDATE transactions SET type = transaction_type WHERE type IS NULL;
;