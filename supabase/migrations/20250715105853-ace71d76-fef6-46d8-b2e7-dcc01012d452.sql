-- Create missions table
CREATE TABLE public.missions (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  description text NOT NULL,
  category text NOT NULL,
  xp_reward integer NOT NULL DEFAULT 0,
  difficulty text NOT NULL CHECK (difficulty IN ('Beginner', 'Intermediate', 'Advanced')),
  expires_at timestamp with time zone,
  creator_id uuid REFERENCES auth.users(id),
  is_official boolean DEFAULT false,
  requirements text[] DEFAULT '{}',
  deliverables text[] DEFAULT '{}',
  max_participants integer,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create mission submissions table
CREATE TABLE public.mission_submissions (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  mission_id uuid REFERENCES public.missions(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text NOT NULL,
  github_url text,
  demo_url text,
  documentation_url text,
  additional_notes text,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'in_review')),
  reviewed_by uuid REFERENCES auth.users(id),
  review_notes text,
  xp_awarded integer DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(mission_id, user_id)
);

-- Create user progress table
CREATE TABLE public.user_progress (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  total_xp integer DEFAULT 0,
  level integer DEFAULT 1,
  current_level_xp integer DEFAULT 0,
  missions_completed integer DEFAULT 0,
  streak_days integer DEFAULT 0,
  last_activity_date date,
  traits jsonb DEFAULT '{}',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Create user mission progress table (for tracking active missions)
CREATE TABLE public.user_mission_progress (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  mission_id uuid REFERENCES public.missions(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'abandoned')),
  started_at timestamp with time zone NOT NULL DEFAULT now(),
  completed_at timestamp with time zone,
  UNIQUE(user_id, mission_id)
);

-- Enable RLS on all tables
ALTER TABLE public.missions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mission_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_mission_progress ENABLE ROW LEVEL SECURITY;

-- Policies for missions (viewable by all, manageable by creators/admins)
CREATE POLICY "Anyone can view missions" ON public.missions FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create missions" ON public.missions FOR INSERT WITH CHECK (auth.uid() = creator_id);
CREATE POLICY "Creators can update their missions" ON public.missions FOR UPDATE USING (auth.uid() = creator_id);
CREATE POLICY "Creators can delete their missions" ON public.missions FOR DELETE USING (auth.uid() = creator_id);

-- Policies for mission submissions
CREATE POLICY "Users can view their own submissions" ON public.mission_submissions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create submissions" ON public.mission_submissions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their pending submissions" ON public.mission_submissions FOR UPDATE USING (auth.uid() = user_id AND status = 'pending');
CREATE POLICY "Mission creators can view submissions for their missions" ON public.mission_submissions FOR SELECT USING (
  auth.uid() IN (SELECT creator_id FROM public.missions WHERE id = mission_id)
);

-- Policies for user progress
CREATE POLICY "Users can view their own progress" ON public.user_progress FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own progress" ON public.user_progress FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own progress" ON public.user_progress FOR UPDATE USING (auth.uid() = user_id);

-- Policies for user mission progress
CREATE POLICY "Users can view their own mission progress" ON public.user_mission_progress FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own mission progress" ON public.user_mission_progress FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own mission progress" ON public.user_mission_progress FOR UPDATE USING (auth.uid() = user_id);

-- Create triggers for updated_at columns
CREATE TRIGGER update_missions_updated_at
  BEFORE UPDATE ON public.missions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_mission_submissions_updated_at
  BEFORE UPDATE ON public.mission_submissions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_progress_updated_at
  BEFORE UPDATE ON public.user_progress
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert sample missions
INSERT INTO public.missions (title, description, category, xp_reward, difficulty, requirements, deliverables, is_official) VALUES
('Build a Solana NFT Marketplace', 'Create a fully functional NFT marketplace on Solana with minting, buying, and selling capabilities', 'tech', 300, 'Advanced', 
 ARRAY['Solana development experience', 'React/TypeScript', 'Anchor framework'], 
 ARRAY['GitHub repository', 'Live demo', 'Documentation'], true),
('Write DeFi Security Guide', 'Create a comprehensive guide on DeFi security best practices for new users', 'education', 120, 'Intermediate',
 ARRAY['DeFi experience', 'Technical writing skills'],
 ARRAY['Written guide (3000+ words)', 'Code examples', 'Infographics'], true),
('Community Discord Bot', 'Build a Discord bot to help manage community activities and XP tracking', 'community', 180, 'Intermediate',
 ARRAY['JavaScript/Python', 'Discord API experience'],
 ARRAY['Working bot', 'Setup instructions', 'Feature documentation'], false),
('DAO Treasury Proposal Review', 'Review and provide feedback on the Q1 2024 treasury allocation proposal', 'governance', 50, 'Beginner',
 ARRAY['DAO membership', 'Basic understanding of tokenomics'],
 ARRAY['Detailed review', 'Vote submission', 'Forum discussion participation'], true),
('Beginner Rust Workshop', 'Host a live workshop teaching Rust basics for blockchain development', 'education', 200, 'Advanced',
 ARRAY['Expert Rust knowledge', 'Teaching experience', 'Video setup'],
 ARRAY['Live workshop', 'Recording', 'Exercise materials'], false);

-- Create function to calculate XP requirements per level
CREATE OR REPLACE FUNCTION public.calculate_xp_for_level(level_num integer)
RETURNS integer
LANGUAGE plpgsql
AS $$
BEGIN
  -- XP needed = level * 100 + (level - 1) * 50
  RETURN level_num * 100 + (level_num - 1) * 50;
END;
$$;

-- Create function to update user level based on XP
CREATE OR REPLACE FUNCTION public.update_user_level()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  new_level integer;
  xp_for_current_level integer;
BEGIN
  -- Calculate new level based on total XP
  new_level := 1;
  WHILE NEW.total_xp >= public.calculate_xp_for_level(new_level) LOOP
    new_level := new_level + 1;
  END LOOP;
  new_level := new_level - 1;
  
  -- Calculate XP for current level
  IF new_level > 1 THEN
    xp_for_current_level := public.calculate_xp_for_level(new_level - 1);
  ELSE
    xp_for_current_level := 0;
  END IF;
  
  -- Update level and current level XP
  NEW.level := new_level;
  NEW.current_level_xp := NEW.total_xp - xp_for_current_level;
  
  RETURN NEW;
END;
$$;

-- Create trigger to auto-update user level
CREATE TRIGGER update_user_level_trigger
  BEFORE UPDATE ON public.user_progress
  FOR EACH ROW
  WHEN (OLD.total_xp IS DISTINCT FROM NEW.total_xp)
  EXECUTE FUNCTION public.update_user_level();