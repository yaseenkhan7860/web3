# Database Schema Update for Topic Description Feature

This folder contains SQL scripts to update the database schema for the topic description feature.

## Instructions to Update the Database

### Option 1: Using the Supabase Dashboard

1. Log in to your Supabase dashboard
2. Navigate to the SQL Editor
3. Copy the contents of `add_description_column.sql` and paste it into the SQL Editor
4. Run the SQL commands

### Option 2: Using the Application

1. Log in to the admin dashboard
2. Click on the "Update Topics Schema" button in the Topic Management section
3. This will automatically add default descriptions to topics that don't have them

## Verifying the Update

After running the update, you should be able to:

1. See descriptions for topics in the admin dashboard
2. Edit topic descriptions by clicking the edit button next to a topic
3. Add new topics with descriptions
4. See topic descriptions when selecting a topic in the submit assignment page

## Troubleshooting

If you encounter permission issues:

1. Make sure the RLS policies are set correctly by running the SQL commands in `add_description_column.sql`
2. In the admin dashboard, click the "Verify Database Access" button to check if the application has the necessary permissions
3. Check the Supabase dashboard for any error logs

If the description column is not showing up:

1. Verify that the column was added by checking the table structure in the Supabase dashboard
2. Try running the SQL command: `ALTER TABLE public.topics ADD COLUMN IF NOT EXISTS description TEXT;` 