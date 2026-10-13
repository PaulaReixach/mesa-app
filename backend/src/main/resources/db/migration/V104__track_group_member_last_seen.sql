-- When each member last opened the group, to count the news by others since then.
-- Existing members start with nothing unseen.
ALTER TABLE group_members
    ADD COLUMN last_seen_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW();
