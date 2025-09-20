-- Create presentations table
CREATE TABLE public.presentations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  roll_number TEXT NOT NULL,
  title TEXT NOT NULL,
  year TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.presentations ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (no authentication required)
CREATE POLICY "Allow public read access to presentations" 
ON public.presentations 
FOR SELECT 
USING (true);

CREATE POLICY "Allow public insert access to presentations" 
ON public.presentations 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Allow public delete access to presentations" 
ON public.presentations 
FOR DELETE 
USING (true);

-- Create storage bucket for presentations
INSERT INTO storage.buckets (id, name, public) VALUES ('presentations', 'presentations', true);

-- Create storage policies for public access
CREATE POLICY "Allow public read access to presentation files" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'presentations');

CREATE POLICY "Allow public upload access to presentation files" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'presentations');

CREATE POLICY "Allow public delete access to presentation files" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'presentations');