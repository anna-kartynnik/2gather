CREATE TABLE meeting_attachments (
  id UUID PRIMARY KEY DEFAULT generate_uuid(),
  meeting_id UUID NOT NULL,
  bucket VARCHAR(512) NOT NULL,
  object_key VARCHAR(512) NOT NULL,
  FOREIGN KEY (meeting_id) REFERENCES meetings (id) ON DELETE CASCADE
);

ALTER TABLE meetings ALTER COLUMN description TYPE TEXT;
ALTER TABLE meeting_questions ALTER COLUMN question_text TYPE TEXT;