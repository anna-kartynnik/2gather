CREATE TABLE users (
	id UUID PRIMARY KEY DEFAULT uuid_in(md5(random()::text || clock_timestamp()::text)::cstring),
	email VARCHAR(255) UNIQUE NOT NULL
);

CREATE TABLE user_calendars (
	user_id UUID NOT NULL,
	calendar_id VARCHAR(255) NOT NULL,
	PRIMARY KEY (user_id, calendar_id),
	FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);

CREATE TABLE meetings (
	id UUID PRIMARY KEY DEFAULT uuid_in(md5(random()::text || clock_timestamp()::text)::cstring),
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
	meeting_id UUID NOT NULL,
	user_id UUID NOT NULL,
	PRIMARY KEY (meeting_id, user_id),
	FOREIGN KEY (meeting_id) REFERENCES meetings (id) ON DELETE CASCADE,
	FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);

CREATE TABLE meeting_proposed_times (
  id UUID PRIMARY KEY DEFAULT uuid_in(md5(random()::text || clock_timestamp()::text)::cstring),
  meeting_id UUID NOT NULL,
  proposed_time TIMESTAMPTZ NOT NULL,
  FOREIGN KEY (meeting_id) REFERENCES meetings (id) ON DELETE CASCADE
);

CREATE TABLE meeting_proposed_time_votes (
  proposed_time_id UUID NOT NULL,
  user_id UUID NOT NULL,
  PRIMARY KEY (proposed_time_id, user_id),
  FOREIGN KEY (proposed_time_id) REFERENCES meeting_proposed_times (id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);