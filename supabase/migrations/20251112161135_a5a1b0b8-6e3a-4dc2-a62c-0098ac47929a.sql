-- Drop existing foreign keys that point to auth.users
ALTER TABLE public.posts DROP CONSTRAINT IF EXISTS posts_user_id_fkey;
ALTER TABLE public.travel_groups DROP CONSTRAINT IF EXISTS travel_groups_creator_id_fkey;
ALTER TABLE public.post_comments DROP CONSTRAINT IF EXISTS post_comments_user_id_fkey;
ALTER TABLE public.group_messages DROP CONSTRAINT IF EXISTS group_messages_user_id_fkey;

-- Add new foreign keys pointing to profiles
ALTER TABLE public.posts 
ADD CONSTRAINT posts_user_id_fkey 
FOREIGN KEY (user_id) 
REFERENCES public.profiles(id) 
ON DELETE CASCADE;

ALTER TABLE public.travel_groups 
ADD CONSTRAINT travel_groups_creator_id_fkey 
FOREIGN KEY (creator_id) 
REFERENCES public.profiles(id) 
ON DELETE CASCADE;

ALTER TABLE public.post_comments
ADD CONSTRAINT post_comments_user_id_fkey
FOREIGN KEY (user_id)
REFERENCES public.profiles(id)
ON DELETE CASCADE;

ALTER TABLE public.group_messages
ADD CONSTRAINT group_messages_user_id_fkey
FOREIGN KEY (user_id)
REFERENCES public.profiles(id)
ON DELETE CASCADE;