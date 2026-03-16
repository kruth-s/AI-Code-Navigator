"""
Script to clear ALL data from Pinecone index
This will delete all vectors from all namespaces
"""

import os
from pinecone import Pinecone

# Load environment variables
from dotenv import load_dotenv
load_dotenv()

def clear_pinecone():
    """Clear all vectors from Pinecone index"""
    
    PINECONE_API_KEY = os.getenv("PINECONE_API_KEY")
    PINECONE_INDEX = os.getenv("PINECONE_INDEX", "codebase")
    
    if not PINECONE_API_KEY:
        print("Error: PINECONE_API_KEY not found in environment variables")
        print("Make sure you have a .env file with PINECONE_API_KEY")
        return
    
    print("🔧 Connecting to Pinecone...")
    try:
        pc = Pinecone(api_key=PINECONE_API_KEY)
        index = pc.Index(PINECONE_INDEX)
        
        print(f"📊 Connected to index: {PINECONE_INDEX}")
        
        # Get index stats
        stats = index.describe_index_stats()
        print(f"\n📈 Current Index Stats:")
        print(f"   Total vectors: {stats.total_vector_count}")
        print(f"   Namespaces: {len(stats.namespaces)}")
        
        if stats.total_vector_count == 0:
            print("\n✅ Index is already empty!")
            return
        
        # Show namespaces
        if stats.namespaces:
            print(f"\n📁 Namespaces found:")
            for ns_name, ns_stats in stats.namespaces.items():
                print(f"   - {ns_name}: {ns_stats.vector_count} vectors")
        
        # Confirm deletion
        print("\n⚠️  WARNING: This will DELETE ALL VECTORS from Pinecone!")
        confirm = input("   Type 'DELETE' to confirm: ")
        
        if confirm != "DELETE":
            print("\n❌ Cancelled. No data was deleted.")
            return
        
        print("\n🗑️  Deleting all vectors...")
        
        # Delete from all namespaces
        if stats.namespaces:
            for ns_name in stats.namespaces.keys():
                print(f"   Deleting namespace: {ns_name}")
                index.delete(delete_all=True, namespace=ns_name)
        
        # Also delete from default namespace (no namespace specified)
        print(f"   Deleting default namespace...")
        index.delete(delete_all=True)
        
        print("\n✅ All vectors deleted successfully!")
        
        # Verify deletion
        print("\n🔍 Verifying deletion...")
        stats = index.describe_index_stats()
        print(f"   Total vectors remaining: {stats.total_vector_count}")
        
        if stats.total_vector_count == 0:
            print("\n🎉 Pinecone index is now completely empty!")
        else:
            print(f"\n⚠️  Warning: {stats.total_vector_count} vectors still remain")
            
    except Exception as e:
        print(f"\n❌ Error: {e}")
        print("\nMake sure:")
        print("1. PINECONE_API_KEY is correct in .env file")
        print("2. PINECONE_INDEX name is correct")
        print("3. You have internet connection")

if __name__ == "__main__":
    print("=" * 60)
    print("  PINECONE CLEANUP SCRIPT")
    print("=" * 60)
    clear_pinecone()
    print("=" * 60)
