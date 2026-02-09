import os
import shutil
from typing import List, Dict, Any
from git import Repo
from langchain_community.embeddings import HuggingFaceEmbeddings
from langchain_text_splitters import RecursiveCharacterTextSplitter
try:
    from pinecone import Pinecone
except Exception as e:
    print(f"Pinecone import error: {e}")
    raise e
from app.core.config import settings

def main():
    repo_url = "https://github.com/kruth-s/object-identity-ai-gcp"
    print(f"Ingesting {repo_url}...")
    
    # Clone and prepare
    repo_name = repo_url.rstrip("/").split("/")[-1].replace(".git", "")
    base_dir = os.path.join(os.getcwd(), "repos")
    repo_dir = os.path.join(base_dir, repo_name)
    
    if os.path.exists(repo_dir):
        print(f"Repository exists at {repo_dir}, attempting to pull...")
        try:
            repo = Repo(repo_dir)
            repo.remotes.origin.pull()
            print("Pull successful.")
        except Exception as e:
            print(f"Pull failed: {e}. Attempting to clean and re-clone.")
            try:
                shutil.rmtree(repo_dir)
                Repo.clone_from(repo_url, repo_dir)
            except Exception as e2:
                print(f"Failed to delete/re-clone: {e2}")
                return
    else:
        print(f"Cloning to {repo_dir}")
        Repo.clone_from(repo_url, repo_dir)
    
    documents = []
    print("Reading files...")
    for root, _, files in os.walk(repo_dir):
        if ".git" in root: continue
        for file in files:
            if file.endswith(('.py', '.js', '.ts', '.jsx', '.tsx', '.md', '.txt')):
                path = os.path.join(root, file)
                try:
                    with open(path, "r", encoding="utf-8") as f:
                        content = f.read()
                        documents.append({"text": content, "source": path, "repo": repo_name})
                except: pass

    splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=200)
    
    chunks_text = []
    chunks_meta = []
    
    print("Splitting...")
    for d in documents:
        splits = splitter.split_text(d["text"])
        for i, s in enumerate(splits):
            chunk_id = f"{repo_name}-{os.path.basename(d['source'])}-{i}"
            chunks_text.append(s)
            chunks_meta.append({"text": s, "source": d["source"], "repo": d["repo"], "chunk_id": chunk_id})

    print(f"Embedding {len(chunks_text)} chunks...")
    if not chunks_text:
        print("No chunks to embed.")
        return
        
    embeddings = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")
    vectors = embeddings.embed_documents(chunks_text)
    
    print("Upserting to Pinecone...")
    pc = Pinecone(api_key=settings.PINECONE_API_KEY)
    index = pc.Index(settings.PINECONE_INDEX)
    
    batch_size = 100
    for i in range(0, len(chunks_text), batch_size):
        batch_vecs = vectors[i:i+batch_size]
        batch_meta = chunks_meta[i:i+batch_size]
        
        to_upsert = []
        for j, vec in enumerate(batch_vecs):
            meta = batch_meta[j]
            to_upsert.append({
                "id": meta["chunk_id"],
                "values": vec,
                "metadata": {"text": meta["text"], "source": meta["source"], "repo": meta["repo"]}
            })
            
        index.upsert(vectors=to_upsert)
        print(f"Batch {i} done")

if __name__ == "__main__":
    main()
