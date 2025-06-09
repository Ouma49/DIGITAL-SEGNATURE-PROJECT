import os
import sys
import subprocess

def check_python_version():
    """Check if Python version is 3.11 or higher."""
    if sys.version_info < (3, 11):
        print("Error: Python 3.11 or higher is required")
        sys.exit(1)

def create_directories():
    """Create necessary directories if they don't exist."""
    directories = [
        'keys/users',
        'input',
        'output',
        'static'
    ]
    for directory in directories:
        os.makedirs(directory, exist_ok=True)
        print(f"✓ Created directory: {directory}")

def install_requirements():
    """Install required packages."""
    try:
        subprocess.check_call([sys.executable, "-m", "pip", "install", "-r", "requirements.txt"])
        print("✓ Installed required packages")
    except subprocess.CalledProcessError:
        print("Error: Failed to install required packages")
        sys.exit(1)

def main():
    print("Setting up Digital Signature Application...")
    
    # Check Python version
    check_python_version()
    print("✓ Python version check passed")
    
    # Create directories
    create_directories()
    
    # Install requirements
    install_requirements()
    
    print("\nSetup completed successfully!")
    print("\nTo start the application:")
    print("1. Run: python -m uvicorn app:app --reload")
    print("2. Open: http://localhost:8000 in your browser")

if __name__ == "__main__":
    main() 