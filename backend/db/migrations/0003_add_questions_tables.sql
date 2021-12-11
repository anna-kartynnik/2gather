CREATE TABLE meeting_questions (
  id UUID PRIMARY KEY DEFAULT generate_uuid(),
  question_text VARCHAR(1024) NOT NULL,
  meeting_id UUID NOT NULL,
  creator_id UUID NOT NULL,
  FOREIGN KEY (meeting_id) REFERENCES meetings (id) ON DELETE CASCADE,
  FOREIGN KEY (creator_id) REFERENCES users (id) ON DELETE CASCADE
);

CREATE TABLE meeting_question_votes (
  id UUID PRIMARY KEY DEFAULT generate_uuid(),
  question_id UUID NOT NULL,
  user_id UUID NOT NULL,
  FOREIGN KEY (question_id) REFERENCES meeting_questions (id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);