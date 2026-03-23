# Odyseus Mesh Development Setup Script
# This script automates the setup of the Odyseus development environment.

import os
import subprocess
import sys

def check_dependencies():
    print("Checking dependencies...")
    deps = ["node", "npm", "cargo", "go", "terraform", "kubectl", "docker"]
    for dep in deps:
        try:
            subprocess.run([dep, "--version"], capture_output=True, check=True)
            print(f"  [OK] {dep}")
        except (subprocess.CalledProcessError, FileNotFoundError):
            print(f"  [MISSING] {dep}")

def setup_env():
    print("Setting up environment variables...")
    if not os.path.exists(".env"):
        with open(".env", "w") as f:
            f.write("GEMINI_API_KEY=\n")
            f.write("NODE_ENV=development\n")
            f.write("PORT=3000\n")
        print("  Created .env file. Please add your GEMINI_API_KEY.")
    else:
        print("  .env file already exists.")

def install_node_deps():
    print("Installing Node.js dependencies...")
    subprocess.run(["npm", "install"], check=True)

def main():
    print("--- [ODYSEUS] Development Setup ---")
    check_dependencies()
    setup_env()
    install_node_deps()
    print("--- [ODYSEUS] Setup Complete ---")

if __name__ == "__main__":
    main()
