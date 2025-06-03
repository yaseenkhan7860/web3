from supabase import create_client

# Initialize Supabase client with your URL and key
supabase_url = 'https://cijnocuczxxuuffuhgkh.supabase.co'
supabase_key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNpam5vY3Vjenh4dXVmZnVoZ2toIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg4OTE2NDcsImV4cCI6MjA2NDQ2NzY0N30.wyNah3PCmrn7-cY8qAFiBph-pXDuwrmfdtXALUimD5Q'
supabase = create_client(supabase_url, supabase_key)

def check_table(table_name):
    print(f"\nChecking {table_name} table...")
    try:
        # Try to select from the table
        result = supabase.table(table_name).select('*').limit(5).execute()
        
        if result.data:
            print(f"✅ {table_name} table exists and contains {len(result.data)} records")
            if table_name == 'topics':
                print("Sample topics:")
                for topic in result.data[:3]:  # Show first 3 topics
                    print(f"  - {topic.get('name')}: {topic.get('description')}")
        else:
            print(f"✅ {table_name} table exists but has no records")
        return True
    except Exception as e:
        print(f"❌ Error accessing {table_name} table: {e}")
        return False

def check_storage_bucket():
    print("\nChecking student-documents storage bucket...")
    try:
        # Try to list files in the bucket
        result = supabase.storage.from_('student-documents').list()
        
        if isinstance(result, list):
            print(f"✅ student-documents bucket exists and contains {len(result)} items")
            if result:
                print("Sample items:")
                for item in result[:3]:  # Show first 3 items
                    print(f"  - {item.get('name')}")
        else:
            print("✅ student-documents bucket exists but has no items")
        return True
    except Exception as e:
        print(f"❌ Error accessing student-documents bucket: {e}")
        return False

def check_storage_policies():
    print("\nStorage policies cannot be directly verified through the API.")
    print("Please check the Supabase dashboard to ensure the following policies exist:")
    print("1. Allow file uploads (INSERT)")
    print("2. Allow file downloads (SELECT)")
    print("3. Allow file management (UPDATE and DELETE)")

def main():
    print("Verifying Supabase setup...")
    
    # Check tables
    topics_ok = check_table('topics')
    assignments_ok = check_table('assignments')
    
    # Check storage
    storage_ok = check_storage_bucket()
    
    # Check policies
    check_storage_policies()
    
    # Summary
    print("\n=== Summary ===")
    print(f"Topics table: {'✅ OK' if topics_ok else '❌ Not working'}")
    print(f"Assignments table: {'✅ OK' if assignments_ok else '❌ Not working'}")
    print(f"Storage bucket: {'✅ OK' if storage_ok else '❌ Not working'}")
    
    if topics_ok and assignments_ok and storage_ok:
        print("\n✅ All systems are ready! Your application should work correctly.")
    else:
        print("\n❌ Some components are not working. Please fix the issues above.")

if __name__ == "__main__":
    main() 