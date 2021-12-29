CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT generate_uuid(),
  meeting_id UUID NOT NULL,
  user_id UUID NOT NULL,
  seen TIMESTAMPTZ,
  text TEXT NOT NULL,
  FOREIGN KEY (meeting_id) REFERENCES meetings (id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);