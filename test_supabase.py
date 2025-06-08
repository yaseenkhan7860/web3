try:
    from supabase import create_client, Client
    print("Supabase package imported successfully!")
except ImportError as e:
    print(f"Error importing supabase: {e}")
    print("Please install the supabase package with: pip install supabase") 