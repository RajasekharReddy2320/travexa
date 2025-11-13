-- Create articles table for Knowledge Base
CREATE TABLE public.articles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  cover_image TEXT,
  tags TEXT[],
  is_published BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.articles ENABLE ROW LEVEL SECURITY;

-- Articles policies
CREATE POLICY "Anyone can view published articles"
  ON public.articles FOR SELECT
  USING (is_published = true OR auth.uid() = user_id);

CREATE POLICY "Users can create own articles"
  ON public.articles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own articles"
  ON public.articles FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own articles"
  ON public.articles FOR DELETE
  USING (auth.uid() = user_id);

-- Create photo albums table
CREATE TABLE public.photo_albums (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.photo_albums ENABLE ROW LEVEL SECURITY;

-- Photo albums policies
CREATE POLICY "Users can view own albums"
  ON public.photo_albums FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own albums"
  ON public.photo_albums FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own albums"
  ON public.photo_albums FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own albums"
  ON public.photo_albums FOR DELETE
  USING (auth.uid() = user_id);

-- Create photos table
CREATE TABLE public.photos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  album_id UUID REFERENCES public.photo_albums(id) ON DELETE SET NULL,
  file_path TEXT NOT NULL,
  caption TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.photos ENABLE ROW LEVEL SECURITY;

-- Photos policies
CREATE POLICY "Users can view own photos"
  ON public.photos FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can upload photos"
  ON public.photos FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own photos"
  ON public.photos FOR DELETE
  USING (auth.uid() = user_id);

-- Create storage bucket for photos
INSERT INTO storage.buckets (id, name, public) 
VALUES ('travel-photos', 'travel-photos', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for photos
CREATE POLICY "Users can upload own photos"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'travel-photos' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Anyone can view photos"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'travel-photos');

CREATE POLICY "Users can delete own photos"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'travel-photos' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Create storage bucket for article images
INSERT INTO storage.buckets (id, name, public) 
VALUES ('article-images', 'article-images', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for article images
CREATE POLICY "Users can upload article images"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'article-images' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Anyone can view article images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'article-images');

CREATE POLICY "Users can delete own article images"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'article-images' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Trigger for updating articles updated_at
CREATE TRIGGER update_articles_updated_at
  BEFORE UPDATE ON public.articles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();