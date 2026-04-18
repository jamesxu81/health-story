-- Optional free-text treatment notes on the illness record (record / edit form)
ALTER TABLE illnesses ADD COLUMN IF NOT EXISTS treat TEXT;
