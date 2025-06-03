-- Add description column if it doesn't exist
ALTER TABLE public.topics ADD COLUMN IF NOT EXISTS description TEXT;

-- Update existing topics with default descriptions if they don't have one
UPDATE public.topics SET description = 'Topics related to ' || name || '.' WHERE description IS NULL;

-- Drop and recreate RLS policies to ensure they're set up correctly
DROP POLICY IF EXISTS "Allow authenticated full access" ON public.topics;
DROP POLICY IF EXISTS "Allow anonymous read" ON public.topics;

-- Create RLS policies
CREATE POLICY "Allow authenticated full access" ON public.topics
    FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Allow anonymous read" ON public.topics
    FOR SELECT
    TO anon
    USING (true);

-- Verify RLS is enabled
ALTER TABLE public.topics ENABLE ROW LEVEL SECURITY;

-- Print a confirmation message
DO $$
BEGIN
    RAISE NOTICE 'Description column added and RLS policies updated for topics table.';
END $$; 