requirements.txt:
supabase

tests/test_app.py:
from supabase import create_client, Client
import pytest

def test_supabase_client():
    url = "your_supabase_url"
    key = "your_supabase_key"
    client = create_client(url, key)
    assert client is not None

pytest.ini:
[pytest]
testpaths = tests
python_files = test_*.py