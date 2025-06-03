from supabase import create_client
import requests
import json

# Initialize Supabase client with your URL and key
supabase_url = 'https://cijnocuczxxuuffuhgkh.supabase.co'
supabase_key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNpam5vY3Vjenh4dXVmZnVoZ2toIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg4OTE2NDcsImV4cCI6MjA2NDQ2NzY0N30.wyNah3PCmrn7-cY8qAFiBph-pXDuwrmfdtXALUimD5Q'
supabase = create_client(supabase_url, supabase_key)

# SQL to create topics table
sql = """
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
"""

# Execute SQL using Supabase REST API
headers = {
    "apikey": supabase_key,
    "Authorization": f"Bearer {supabase_key}",
    "Content-Type": "application/json",
    "Prefer": "return=minimal"
}

response = requests.post(
    f"{supabase_url}/rest/v1/rpc/exec",
    headers=headers,
    json={"query": sql}
)

if response.status_code == 200:
    print("Topics table created successfully!")
else:
    print(f"Error creating topics table: {response.status_code}")
    print(response.text)

# Verify if the table was created by trying to fetch topics
try:
    result = supabase.table('topics').select('*').execute()
    if result.data:
        print(f"Successfully retrieved {len(result.data)} topics:")
        for topic in result.data:
            print(f"- {topic.get('name')}: {topic.get('description')}")
    else:
        print("Topics table exists but has no data.")
except Exception as e:
    print(f"Error verifying topics table: {e}") 