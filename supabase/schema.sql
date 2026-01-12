-- MeetLink Database Schema
-- Run this in Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Events table
CREATE TABLE IF NOT EXISTS events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    date TIMESTAMPTZ NOT NULL,
    end_date TIMESTAMPTZ,
    location TEXT NOT NULL,
    description TEXT,
    cover_image_url TEXT,
    directory_access_days INTEGER DEFAULT 30,
    language TEXT DEFAULT 'both' CHECK (language IN ('ko', 'en', 'both')),
    organizer_id UUID,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    auth_user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE SET NULL,
    linkedin_url TEXT UNIQUE NOT NULL,
    linkedin_id TEXT,
    name TEXT NOT NULL,
    headline TEXT,
    photo_url TEXT,
    company TEXT,
    email TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for auth_user_id lookup
CREATE INDEX IF NOT EXISTS idx_users_auth_user_id ON users(auth_user_id);

-- Participants table (Event <-> User junction)
CREATE TABLE IF NOT EXISTS participants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    visibility TEXT DEFAULT 'public' CHECK (visibility IN ('public', 'connections_only', 'hidden')),
    qr_code_data TEXT UNIQUE NOT NULL,
    custom_note TEXT,
    is_organizer BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(event_id, user_id)
);

-- Connections table
CREATE TABLE IF NOT EXISTS connections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    participant_a_id UUID NOT NULL REFERENCES participants(id) ON DELETE CASCADE,
    participant_b_id UUID NOT NULL REFERENCES participants(id) ON DELETE CASCADE,
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    connection_type TEXT DEFAULT 'qr_scan' CHECK (connection_type IN ('qr_scan', 'profile_view', 'mutual_scan')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(participant_a_id, participant_b_id)
);

-- Indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_events_slug ON events(slug);
CREATE INDEX IF NOT EXISTS idx_events_is_active ON events(is_active);
CREATE INDEX IF NOT EXISTS idx_users_linkedin_url ON users(linkedin_url);
CREATE INDEX IF NOT EXISTS idx_participants_event_id ON participants(event_id);
CREATE INDEX IF NOT EXISTS idx_participants_user_id ON participants(user_id);
CREATE INDEX IF NOT EXISTS idx_participants_visibility ON participants(visibility);
CREATE INDEX IF NOT EXISTS idx_connections_participant_a ON connections(participant_a_id);
CREATE INDEX IF NOT EXISTS idx_connections_participant_b ON connections(participant_b_id);
CREATE INDEX IF NOT EXISTS idx_connections_event_id ON connections(event_id);

-- Full text search index for user search
CREATE INDEX IF NOT EXISTS idx_users_search ON users USING gin(
    to_tsvector('simple', coalesce(name, '') || ' ' || coalesce(headline, '') || ' ' || coalesce(company, ''))
);

-- Updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at triggers
DROP TRIGGER IF EXISTS update_events_updated_at ON events;
CREATE TRIGGER update_events_updated_at
    BEFORE UPDATE ON events
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_participants_updated_at ON participants;
CREATE TRIGGER update_participants_updated_at
    BEFORE UPDATE ON participants
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS)
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE connections ENABLE ROW LEVEL SECURITY;

-- Public read access for active events
CREATE POLICY "Events are viewable by everyone" ON events
    FOR SELECT USING (is_active = true);

-- Authenticated users can create events
CREATE POLICY "Authenticated users can create events" ON events
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Public read access for users (needed for participant lookup)
CREATE POLICY "Users are viewable by everyone" ON users
    FOR SELECT USING (true);

-- Users can insert themselves
CREATE POLICY "Users can insert themselves" ON users
    FOR INSERT WITH CHECK (true);

-- Users can update themselves
CREATE POLICY "Users can update themselves" ON users
    FOR UPDATE USING (true);

-- Public read access for public participants
CREATE POLICY "Public participants are viewable by everyone" ON participants
    FOR SELECT USING (visibility = 'public');

-- Anyone can join as participant
CREATE POLICY "Anyone can join as participant" ON participants
    FOR INSERT WITH CHECK (true);

-- Connections are viewable by everyone
CREATE POLICY "Connections are viewable by everyone" ON connections
    FOR SELECT USING (true);

-- Anyone can create connections
CREATE POLICY "Anyone can create connections" ON connections
    FOR INSERT WITH CHECK (true);

-- Insert sample event for testing
INSERT INTO events (name, slug, date, end_date, location, description, directory_access_days, language)
VALUES (
    '창업자들이 꼭 알아야 할 바이브코딩 in SF',
    'vibe-coding-sf-2025',
    '2025-01-14 14:00:00-08',
    '2025-01-14 16:30:00-08',
    '300 Grant Ave Suite 500, San Francisco, CA 94108',
    '스타트업 창업자를 위한 바이브코딩 네트워킹 이벤트',
    30,
    'both'
) ON CONFLICT (slug) DO NOTHING;
