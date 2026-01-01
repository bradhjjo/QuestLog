-- Create achievements table
CREATE TABLE achievements (
  id text PRIMARY KEY,
  name text NOT NULL,
  description text NOT NULL,
  icon text NOT NULL,
  category text NOT NULL, -- e.g., 'streak', 'count', 'level'
  requirement_type text NOT NULL, -- e.g., 'total_quests', 'streak_days', 'level_reached'
  requirement_value integer NOT NULL
);

-- Create user_achievements table
CREATE TABLE user_achievements (
  user_id uuid REFERENCES auth.users NOT NULL,
  achievement_id text REFERENCES achievements NOT NULL,
  unlocked_at timestamp with time zone DEFAULT now(),
  PRIMARY KEY (user_id, achievement_id)
);

-- Insert some initial achievements
INSERT INTO achievements (id, name, description, icon, category, requirement_type, requirement_value) VALUES
('first_step', 'First Step', 'Complete your first quest', '👞', 'count', 'total_quests', 1),
('quest_master', 'Quest Master', 'Complete 10 quests', '👑', 'count', 'total_quests', 10),
('early_bird', 'Early Bird', 'Complete 5 daily quests', '🌅', 'count', 'daily_quests', 5),
('level_5', 'High Five', 'Reach Level 5', '🖐️', 'level', 'level_reached', 5),
('streak_7', 'Sovereign Streak', 'Maintain a 7-day streak', '🔥', 'streak', 'streak_days', 7);

-- RLS for user_achievements
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own achievements"
  ON user_achievements FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own achievements"
  ON user_achievements FOR INSERT
  WITH CHECK (auth.uid() = user_id);
