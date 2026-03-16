
import os
from langchain_community.embeddings import HuggingFaceEmbeddings

# This script is used during the Docker build to pre-download the model
# so it's baked into the image, preventing downloads at runtime.
if __name__ == "__main__":
    print("Pre-downloading embedding model...")
    HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")
    print("Model downloaded successfully!")
