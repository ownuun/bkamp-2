-- MeetLink Auth Schema Migration
-- Run this AFTER the initial schema.sql

-- 1. Add auth_user_id column to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS auth_user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_users_auth_user_id ON users(auth_user_id);

-- 2. Drop old permissive RLS policies
DROP POLICY IF EXISTS "Public participants are viewable by everyone" ON participants;
DROP POLICY IF EXISTS "Users are viewable by everyone" ON users;
DROP POLICY IF EXISTS "Users can insert themselves" ON users;
DROP POLICY IF EXISTS "Anyone can join as participant" ON participants;

-- 3. New RLS policies for users table

-- Users can view their own profile
CREATE POLICY "Users can view own profile" ON users
    FOR SELECT USING (auth_user_id = auth.uid());

-- Users can view other users if they share an event
CREATE POLICY "Users can view participants in shared events" ON users
    FOR SELECT USING (
        id IN (
            SELECT p.user_id FROM participants p
            WHERE p.event_id IN (
                SELECT p2.event_id FROM participants p2
                JOIN users u ON p2.user_id = u.id
                WHERE u.auth_user_id = auth.uid()
            )
        )
    );

-- Authenticated users can insert their own profile
CREATE POLICY "Authenticated users can insert profile" ON users
    FOR INSERT WITH CHECK (auth_user_id = auth.uid());

-- Users can update their own profile
CREATE POLICY "Users can update own profile" ON users
    FOR UPDATE USING (auth_user_id = auth.uid());

-- 4. New RLS policies for participants table

-- Users can view participants of events they joined
CREATE POLICY "Users can view participants in joined events" ON participants
    FOR SELECT USING (
        event_id IN (
            SELECT p.event_id FROM participants p
            JOIN users u ON p.user_id = u.id
            WHERE u.auth_user_id = auth.uid()
        )
    );

-- Authenticated users can join events
CREATE POLICY "Authenticated users can join events" ON participants
    FOR INSERT WITH CHECK (
        user_id IN (
            SELECT id FROM users WHERE auth_user_id = auth.uid()
        )
    );

-- 5. Keep events publicly viewable (no change needed)
-- "Events are viewable by everyone" policy remains

-- 6. Connections policies update
DROP POLICY IF EXISTS "Connections are viewable by everyone" ON connections;
DROP POLICY IF EXISTS "Anyone can create connections" ON connections;

-- Users can view their own connections
CREATE POLICY "Users can view own connections" ON connections
    FOR SELECT USING (
        participant_a_id IN (
            SELECT p.id FROM participants p
            JOIN users u ON p.user_id = u.id
            WHERE u.auth_user_id = auth.uid()
        )
        OR
        participant_b_id IN (
            SELECT p.id FROM participants p
            JOIN users u ON p.user_id = u.id
            WHERE u.auth_user_id = auth.uid()
        )
    );

-- Users can create connections
CREATE POLICY "Users can create connections" ON connections
    FOR INSERT WITH CHECK (
        participant_a_id IN (
            SELECT p.id FROM participants p
            JOIN users u ON p.user_id = u.id
            WHERE u.auth_user_id = auth.uid()
        )
    );
