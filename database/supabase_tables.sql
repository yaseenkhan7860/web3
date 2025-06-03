-- Create assignments table
CREATE TABLE IF NOT EXISTS public.assignments (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    student_name TEXT NOT NULL,
    phone_number TEXT,
    college TEXT,
    location TEXT,
    topic TEXT,
    file_url TEXT,
    file_type TEXT,
    text_content TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create topics table
CREATE TABLE IF NOT EXISTS public.topics (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add description column if it doesn't exist
ALTER TABLE public.topics ADD COLUMN IF NOT EXISTS description TEXT;

-- Add RLS policies for assignments
ALTER TABLE public.assignments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow anonymous insert" ON public.assignments
    FOR INSERT
    TO anon
    WITH CHECK (true);

CREATE POLICY "Allow authenticated read" ON public.assignments
    FOR SELECT
    TO authenticated
    USING (true);

-- Add RLS policies for topics
ALTER TABLE public.topics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow authenticated full access" ON public.topics
    FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Allow anonymous read" ON public.topics
    FOR SELECT
    TO anon
    USING (true);

-- Drop and recreate policies if needed (run this if you have permission issues)
DROP POLICY IF EXISTS "Allow authenticated full access" ON public.topics;
DROP POLICY IF EXISTS "Allow anonymous read" ON public.topics;

CREATE POLICY "Allow authenticated full access" ON public.topics
    FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Allow anonymous read" ON public.topics
    FOR SELECT
    TO anon
    USING (true); 