-- Add category column to todos table
ALTER TABLE todos ADD COLUMN category text CHECK (category IN ('body', 'mind', 'social', 'home', 'other')) DEFAULT 'other';
