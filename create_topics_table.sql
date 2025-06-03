-- Create topics table
CREATE TABLE IF NOT EXISTS public.topics (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    name text UNIQUE NOT NULL,
    description text,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.topics ENABLE ROW LEVEL SECURITY;

-- Create policy for all operations
CREATE POLICY "Allow all operations on topics"
ON public.topics
FOR ALL
TO public
USING (true)
WITH CHECK (true);

-- Add some default topics
INSERT INTO public.topics (name, description)
VALUES 
    ('Web Development', 'Topics related to web technologies, frameworks, and best practices for building web applications.'),
    ('Mobile App Development', 'Topics covering native and cross-platform mobile application development for iOS and Android.'),
    ('Machine Learning', 'Topics on algorithms, models, and applications of machine learning and artificial intelligence.'),
    ('Data Science', 'Topics related to data analysis, visualization, and extracting insights from large datasets.'),
    ('Cybersecurity', 'Topics covering network security, encryption, threat analysis, and security best practices.'),
    ('Cloud Computing', 'Topics on cloud platforms, services, architecture, and deployment strategies.'),
    ('Other', 'Any other technology topic not covered in the main categories.')
ON CONFLICT (name) DO NOTHING; 