import shutil
import os
import stat

def handle_remove_readonly(func, path, exc):
    """Error handler for Windows readonly files"""
    os.chmod(path, stat.S_IWRITE)
    func(path)

def cleanup_local_repos():
    repos_dir = os.path.join(os.getcwd(), "repos")
    
    if os.path.exists(repos_dir):
        print(f"Deleting local repos at: {repos_dir}")
        try:
            shutil.rmtree(repos_dir, onerror=handle_remove_readonly)
            print("Local repos deleted successfully!")
            print("   (All data is safely stored in Pinecone)")
        except Exception as e:
            print(f"Error: {e}")
            print("\nAlternative: Run this command manually:")
            print(f"   rmdir /s /q \"{repos_dir}\"")
    else:
        print("No local repos found.")

if __name__ == "__main__":
    cleanup_local_repos()
