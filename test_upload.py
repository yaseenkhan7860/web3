from supabase import create_client
import uuid

# Initialize Supabase client with your URL and key
supabase_url = 'https://cijnocuczxxuuffuhgkh.supabase.co'
supabase_key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNpam5vY3Vjenh4dXVmZnVoZ2toIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg4OTE2NDcsImV4cCI6MjA2NDQ2NzY0N30.wyNah3PCmrn7-cY8qAFiBph-pXDuwrmfdtXALUimD5Q'
supabase = create_client(supabase_url, supabase_key)

# Create a simple text file for testing
test_content = b"This is a test file for upload."
filename = f"{str(uuid.uuid4())}.txt"
file_path = f"assignments/{filename}"

try:
    # Upload to Supabase Storage
    result = supabase.storage.from_('student-documents').upload(file_path, test_content)
    
    if hasattr(result, 'error') and result.error:
        print(f"Upload error: {result.error}")
    else:
        # Get public URL
        file_url = supabase.storage.from_('student-documents').get_public_url(file_path)
        print(f"File uploaded successfully. URL: {file_url}")
        
        # Now test creating an assignment record
        assignment_data = {
            'student_name': 'Test Student',
            'phone_number': '1234567890',
            'college': 'Test College',
            'location': 'Test Location',
            'topic': 'Web Development',
            'file_url': file_url,
            'file_type': 'text'
        }
        
        # Insert assignment data into Supabase
        result = supabase.table('assignments').insert(assignment_data).execute()
        
        if hasattr(result, 'error') and result.error:
            print(f"Assignment insert error: {result.error}")
        else:
            print("Assignment record created successfully!")
            print(f"Assignment ID: {result.data[0]['id'] if result.data else 'Unknown'}")
            
except Exception as e:
    print(f"Exception during test: {e}") 