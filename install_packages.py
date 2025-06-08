import subprocess
import sys

def install(package):
    print(f"Installing {package}...")
    subprocess.check_call([sys.executable, "-m", "pip", "install", package])

if __name__ == "__main__":
    packages = [
        "supabase>=1.0.3",
        "flask>=2.3.3",
        "python-dotenv>=1.0.0",
        "gunicorn>=21.2.0",
        "werkzeug>=3.1.3",
        "flask-cors>=4.0.0",
        "requests>=2.31.0"
    ]
    
    for package in packages:
        install(package)
    
    print("All packages installed successfully!") 