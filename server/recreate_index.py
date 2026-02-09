from pinecone import Pinecone, ServerlessSpec
from app.core.config import settings
import time

def recreate_index():
    print("Connecting to Pinecone...")
    pc = Pinecone(api_key=settings.PINECONE_API_KEY)
    
    index_name = settings.PINECONE_INDEX
    
    # Check if index exists
    existing_indexes = [index.name for index in pc.list_indexes()]
    
    if index_name in existing_indexes:
        print(f"Deleting existing index '{index_name}'...")
        pc.delete_index(index_name)
        print("Waiting for deletion to complete...")
        time.sleep(5)
    
    print(f"Creating new index '{index_name}' with dimension=384...")
    pc.create_index(
        name=index_name,
        dimension=384,  # all-MiniLM-L6-v2 dimension
        metric="cosine",
        spec=ServerlessSpec(
            cloud="aws",
            region="us-east-1"
        )
    )
    
    print("Waiting for index to be ready...")
    while not pc.describe_index(index_name).status['ready']:
        time.sleep(1)
    
    print(f"Index '{index_name}' created successfully!")
    print(f"   Dimension: 384")
    print(f"   Metric: cosine")
    print(f"   Cloud: AWS (us-east-1)")
    
    # Verify
    index_info = pc.describe_index(index_name)
    print(f"\nIndex stats: {index_info}")

if __name__ == "__main__":
    recreate_index()
