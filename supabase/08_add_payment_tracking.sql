-- Add prepaid_amount and cod_amount columns to orders table
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS prepaid_amount DECIMAL(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS cod_amount DECIMAL(10,2) DEFAULT 0;

-- Update existing orders to set cod_amount equal to total if not already set
UPDATE orders 
SET cod_amount = total 
WHERE cod_amount = 0 OR cod_amount IS NULL;
