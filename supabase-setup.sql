-- Supabase SQL Setup Script
-- Run this in Supabase SQL Editor to set up the database

-- Create milestones table
CREATE TABLE IF NOT EXISTS milestones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    title TEXT NOT NULL,
    description TEXT,
    date DATE NOT NULL,
    category TEXT NOT NULL DEFAULT 'other',
    media_urls TEXT[] DEFAULT '{}',
    media_types TEXT[] DEFAULT '{}',
    likes INTEGER DEFAULT 0
);

-- Create comments table
CREATE TABLE IF NOT EXISTS comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    milestone_id UUID NOT NULL REFERENCES milestones(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    author_name TEXT NOT NULL DEFAULT '匿名'
);

-- Create albums table
CREATE TABLE IF NOT EXISTS albums (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    name TEXT NOT NULL,
    description TEXT,
    cover_image TEXT
);

-- Create album_items table
CREATE TABLE IF NOT EXISTS album_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    album_id UUID NOT NULL REFERENCES albums(id) ON DELETE CASCADE,
    milestone_id UUID REFERENCES milestones(id) ON DELETE SET NULL,
    media_url TEXT NOT NULL,
    media_type TEXT NOT NULL,
    caption TEXT
);

-- Enable Row Level Security (optional for extra security)
ALTER TABLE milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE albums ENABLE ROW LEVEL SECURITY;
ALTER TABLE album_items ENABLE ROW LEVEL SECURITY;

-- Create policies (allow public read, authenticated write)
CREATE POLICY "Allow public read on milestones" ON milestones FOR SELECT USING (true);
CREATE POLICY "Allow authenticated insert on milestones" ON milestones FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated update on milestones" ON milestones FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Allow public read on comments" ON comments FOR SELECT USING (true);
CREATE POLICY "Allow authenticated insert on comments" ON comments FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow public read on albums" ON albums FOR SELECT USING (true);
CREATE POLICY "Allow authenticated insert on albums" ON albums FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated update on albums" ON albums FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated delete on albums" ON albums FOR DELETE USING (auth.role() = 'authenticated');

CREATE POLICY "Allow public read on album_items" ON album_items FOR SELECT USING (true);
CREATE POLICY "Allow authenticated insert on album_items" ON album_items FOR INSERT WITH CHECK (auth.role() = 'authenticated');

\echo '✅ Database setup complete!'
