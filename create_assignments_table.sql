-- Create assignments table
CREATE TABLE IF NOT EXISTS public.assignments (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    student_name text NOT NULL,
    phone_number text,
    college text,
    location text,
    topic text,
    file_url text,
    file_type text,
    text_content text,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.assignments ENABLE ROW LEVEL SECURITY;

-- Create policy for all operations
CREATE POLICY "Allow all operations on assignments"
ON public.assignments
FOR ALL
TO public
USING (true)
WITH CHECK (true); 