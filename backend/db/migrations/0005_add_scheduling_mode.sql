ALTER TABLE meetings ADD COLUMN scheduling_mode VARCHAR(255) NOT NULL DEFAULT 'with-votes';
ALTER TABLE meeting_proposed_time_votes ADD COLUMN created TIMESTAMPTZ NOT NULL DEFAULT now();