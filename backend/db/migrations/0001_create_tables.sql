CREATE FUNCTION generate_uuid() RETURNS UUID
  AS 'SELECT uuid_in(md5(random()::text || clock_timestamp()::text)::cstring)'
  LANGUAGE SQL;

CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT generate_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL
);

CREATE TABLE user_calendars (
  user_id UUID NOT NULL,
  calendar_id VARCHAR(255) NOT NULL,
  PRIMARY KEY (user_id, calendar_id),
  FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);

CREATE TABLE meetings (
  id UUID PRIMARY KEY DEFAULT generate_uuid(),
  name VARCHAR(255) NOT NULL,
  description VARCHAR(1024),
  preferred_time_start TIMESTAMPTZ NOT NULL,
  preferred_time_end TIMESTAMPTZ NOT NULL,
  duration SMALLINT NOT NULL,
  creator_id UUID NOT NULL,
  status VARCHAR(32) NOT NULL DEFAULT 'created',
  FOREIGN KEY (creator_id) REFERENCES users (id) ON DELETE CASCADE
);

CREATE TABLE meeting_participants (
  id UUID PRIMARY KEY DEFAULT generate_uuid(),
  meeting_id UUID NOT NULL,
  user_id UUID,
  user_email VARCHAR(255),
  FOREIGN KEY (meeting_id) REFERENCES meetings (id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);

CREATE TABLE meeting_proposed_times (
  id UUID PRIMARY KEY DEFAULT generate_uuid(),
  meeting_id UUID NOT NULL,
  proposed_time TIMESTAMPTZ NOT NULL,
  FOREIGN KEY (meeting_id) REFERENCES meetings (id) ON DELETE CASCADE
);

CREATE TABLE meeting_proposed_time_votes (
  id UUID PRIMARY KEY DEFAULT generate_uuid(),
  proposed_time_id UUID NOT NULL,
  user_id UUID NOT NULL,
  FOREIGN KEY (proposed_time_id) REFERENCES meeting_proposed_times (id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);