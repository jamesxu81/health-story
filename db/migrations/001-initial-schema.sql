-- Health Story - Initial Database Schema
-- This migration file will be executed automatically on container startup

-- Create users table (for future multi-user support)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create illnesses table (core entity)
CREATE TABLE IF NOT EXISTS illnesses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id VARCHAR(255) NOT NULL, -- For MVP, extracted from auth context as string
  name VARCHAR(255) NOT NULL,
  date_started DATE NOT NULL,
  date_ended DATE,
  status VARCHAR(50) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'resolved')),
  symptoms JSONB NOT NULL DEFAULT '[]'::jsonb, -- Array of symptom objects
  cause TEXT,
  notes TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for common queries
CREATE INDEX idx_illnesses_user_date ON illnesses(user_id, date_started DESC);
CREATE INDEX idx_illnesses_user_status ON illnesses(user_id, status);
CREATE INDEX idx_illnesses_name ON illnesses(name);

-- Create treatments table
CREATE TABLE IF NOT EXISTS treatments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  illness_id UUID NOT NULL REFERENCES illnesses(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  type VARCHAR(50) NOT NULL CHECK (type IN ('medicine', 'home_remedy', 'doctor_recommendation', 'other')),
  effectiveness VARCHAR(50) NOT NULL DEFAULT 'unknown' CHECK (effectiveness IN ('effective', 'ineffective', 'unknown')),
  started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  ended_at TIMESTAMP,
  notes TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_treatments_illness ON treatments(illness_id);

-- Create photos table
CREATE TABLE IF NOT EXISTS photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  illness_id UUID NOT NULL REFERENCES illnesses(id) ON DELETE CASCADE,
  blob_url VARCHAR(1000) NOT NULL,
  filename VARCHAR(255) NOT NULL,
  size_bytes INTEGER NOT NULL,
  mime_type VARCHAR(100) NOT NULL,
  uploaded_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_photos_illness ON photos(illness_id);
