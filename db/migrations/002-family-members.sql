-- Family Members - multi-person support
-- Allows tracking illnesses per family member (kid, spouse, etc.)

CREATE TABLE IF NOT EXISTS family_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  color VARCHAR(7) NOT NULL DEFAULT '#0d9488', -- hex color for avatar
  date_of_birth DATE,
  relationship VARCHAR(100), -- e.g. 'child', 'spouse', 'self', 'parent'
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_family_members_user ON family_members(user_id);

-- Add nullable family_member_id to illnesses (backward compatible)
ALTER TABLE illnesses ADD COLUMN IF NOT EXISTS family_member_id UUID REFERENCES family_members(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_illnesses_family_member ON illnesses(family_member_id);
