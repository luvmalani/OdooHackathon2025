#!/usr/bin/env python3
"""
Start the FastAPI server
"""
import subprocess
import sys
import os

def main():
    """Start the FastAPI development server"""
    # Change to server directory
    server_dir = os.path.dirname(os.path.abspath(__file__))
    os.chdir(server_dir)
    
    try:
        # Start uvicorn with auto-reload
        subprocess.run([
            sys.executable, "-m", "uvicorn", 
            "main:app",
            "--host", "0.0.0.0",
            "--port", "5000",
            "--reload",
            "--log-level", "info"
        ])
    except KeyboardInterrupt:
        print("\nServer stopped.")
    except Exception as e:
        print(f"Error starting server: {e}")
        return 1
    
    return 0

if __name__ == "__main__":
    sys.exit(main())