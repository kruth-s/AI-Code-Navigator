from pinecone import Pinecone
from app.core.config import settings

def check_pinecone_stats():
    print("Checking Pinecone Index Stats...")
    print("=" * 60)
    
    pc = Pinecone(api_key=settings.PINECONE_API_KEY)
    index = pc.Index(settings.PINECONE_INDEX)
    
    stats = index.describe_index_stats()
    
    print(f"Index Name: {settings.PINECONE_INDEX}")
    print(f"Total Vectors: {stats.total_vector_count}")
    print(f"Dimension: {stats.dimension}")
    print(f"Namespaces: {stats.namespaces}")
    
    print("\nData successfully stored in Pinecone!")
    print(f"   You can view it at: https://app.pinecone.io/")

if __name__ == "__main__":
    check_pinecone_stats()
