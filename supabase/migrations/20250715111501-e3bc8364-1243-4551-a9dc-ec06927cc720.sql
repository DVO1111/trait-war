-- Add creator review fields to mission_submissions
ALTER TABLE public.mission_submissions 
ADD COLUMN IF NOT EXISTS reviewed_at timestamp with time zone,
ADD COLUMN IF NOT EXISTS review_feedback text;

-- Create creator notifications table
CREATE TABLE IF NOT EXISTS public.creator_notifications (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  creator_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  mission_id uuid REFERENCES public.missions(id) ON DELETE CASCADE,
  submission_id uuid REFERENCES public.mission_submissions(id) ON DELETE CASCADE,
  notification_type text NOT NULL CHECK (notification_type IN ('new_submission', 'submission_update')),
  is_read boolean DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on creator_notifications
ALTER TABLE public.creator_notifications ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist and recreate them
DROP POLICY IF EXISTS "Creators can view their own notifications" ON public.creator_notifications;
DROP POLICY IF EXISTS "System can create notifications" ON public.creator_notifications;
DROP POLICY IF EXISTS "Creators can update their own notifications" ON public.creator_notifications;
DROP POLICY IF EXISTS "Mission creators can view submissions for their missions" ON public.mission_submissions;
DROP POLICY IF EXISTS "Mission creators can update submissions for their missions" ON public.mission_submissions;

-- Policies for creator notifications
CREATE POLICY "Creators can view their own notifications" 
ON public.creator_notifications FOR SELECT 
USING (auth.uid() = creator_id);

CREATE POLICY "System can create notifications" 
ON public.creator_notifications FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Creators can update their own notifications" 
ON public.creator_notifications FOR UPDATE 
USING (auth.uid() = creator_id);

-- Update RLS policies for mission_submissions to allow creators to view submissions for their missions
CREATE POLICY "Mission creators can view submissions for their missions" 
ON public.mission_submissions FOR SELECT 
USING (
  auth.uid() IN (
    SELECT creator_id FROM public.missions WHERE id = mission_id
  )
);

CREATE POLICY "Mission creators can update submissions for their missions" 
ON public.mission_submissions FOR UPDATE 
USING (
  auth.uid() IN (
    SELECT creator_id FROM public.missions WHERE id = mission_id
  )
);

-- Create function to notify creators of new submissions
CREATE OR REPLACE FUNCTION public.notify_creator_of_submission()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  -- Insert notification for the mission creator
  INSERT INTO public.creator_notifications (creator_id, mission_id, submission_id, notification_type)
  SELECT creator_id, NEW.mission_id, NEW.id, 'new_submission'
  FROM public.missions 
  WHERE id = NEW.mission_id AND creator_id IS NOT NULL;
  
  RETURN NEW;
END;
$$;

-- Create trigger to notify creators when submissions are made
DROP TRIGGER IF EXISTS notify_creator_on_submission ON public.mission_submissions;
CREATE TRIGGER notify_creator_on_submission
  AFTER INSERT ON public.mission_submissions
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_creator_of_submission();

-- Create function to award XP when submission is approved
CREATE OR REPLACE FUNCTION public.award_xp_on_approval()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  -- If submission status changed to approved, award XP
  IF OLD.status != 'approved' AND NEW.status = 'approved' THEN
    -- Get the XP reward for this mission
    UPDATE public.user_progress 
    SET total_xp = total_xp + (SELECT xp_reward FROM public.missions WHERE id = NEW.mission_id),
        missions_completed = missions_completed + 1,
        last_activity_date = CURRENT_DATE
    WHERE user_id = NEW.user_id;
    
    -- Update the submission with XP awarded
    NEW.xp_awarded = (SELECT xp_reward FROM public.missions WHERE id = NEW.mission_id);
    NEW.reviewed_at = now();
    NEW.reviewed_by = auth.uid();
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger to award XP when submission is approved
DROP TRIGGER IF EXISTS award_xp_on_approval_trigger ON public.mission_submissions;
CREATE TRIGGER award_xp_on_approval_trigger
  BEFORE UPDATE ON public.mission_submissions
  FOR EACH ROW
  EXECUTE FUNCTION public.award_xp_on_approval();