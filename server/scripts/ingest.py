from git import Repo
import os
import shutil
from typing import List, Dict, Any
from langchain_community.embeddings import HuggingFaceEmbeddings
from langchain_text_splitters import RecursiveCharacterTextSplitter
from pinecone import Pinecone
from app.core.config import settings

def ingest_repository(repo_url: str):
    print(f"Starting ingestion for {repo_url}...")
    
    # 1. Clone
    repo_name = repo_url.rstrip("/").split("/")[-1].replace(".git", "")
    base_path = os.path.join(os.getcwd(), "repos")
    repo_path = os.path.join(base_path, repo_name)
    
    if os.path.exists(repo_path):
        print(f"Repository already exists at {repo_path}, pulling latest...")
        try:
            repo = Repo(repo_path)
            repo.remotes.origin.pull()
        except:
            print("Pull failed, re-cloning...")
            shutil.rmtree(repo_path)
            Repo.clone_from(repo_url, repo_path)
    else:
        print(f"Cloning to {repo_path}...")
        os.makedirs(base_path, exist_ok=True)
        Repo.clone_from(repo_url, repo_path)
    
    # 2. Walk and Load
    documents = []
    print("Reading files...")
    for root, _, files in os.walk(repo_path):
        if ".git" in root:
            continue
        for file in files:
            file_path = os.path.join(root, file)
            # Filter non-text or large files
            if file.endswith(('.py', '.js', '.ts', '.jsx', '.tsx', '.md', '.txt', '.java', '.c', '.cpp', '.h', '.go', '.rs')):
                try:
                    with open(file_path, "r", encoding="utf-8") as f:
                        content = f.read()
                        documents.append({"content": content, "source": file_path, "repo": repo_name})
                except Exception as e:
                    print(f"Skipping {file}: {e}")
    
    print(f"Found {len(documents)} valid text files.")

    # 3. Chunk
    splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=200)
    chunks = []
    for doc in documents:
        splits = splitter.split_text(doc["content"])
        for i, split in enumerate(splits):
            chunks.append({
                "id": f"{repo_name}-{os.path.basename(doc['source'])}-{i}",
                "text": split,
                "metadata": {"source": doc["source"], "repo": doc["repo"]}
            })
    
    print(f"Created {len(chunks)} chunks.")
    
    # 4. Embed and Upsert
    print("Generating embeddings...")
    embeddings = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")
    
    pc = Pinecone(api_key=settings.PINECONE_API_KEY)
    index = pc.Index(settings.PINECONE_INDEX)
    
    batch_size = 100
    total_batches = (len(chunks) + batch_size - 1) // batch_size
    
    for i in range(0, len(chunks), batch_size):
        batch = chunks[i:i+batch_size]
        texts = [c["text"] for c in batch]
        ids = [c["id"] for c in batch]
        metadatas = [c["metadata"] for c in batch] # Update: add text to metadata for retrieval
        for j, m in enumerate(metadatas):
            m["text"] = texts[j]

        embeds = embeddings.embed_documents(texts)
        
        vectors = []
        for j in range(len(batch)):
            vectors.append({
                "id": ids[j],
                "values": embeds[j],
                "metadata": metadatas[j]
            })
            
        index.upsert(vectors=vectors)
        print(f"Upserted batch {i//batch_size + 1}/{total_batches}")

if __name__ == "__main__":
    import sys
    if len(sys.argv) > 1:
        repo = sys.argv[1]
    else:
        repo = "https://github.com/kruth-s/object-identity-ai-gcp"
    ingest_repository(repo)
