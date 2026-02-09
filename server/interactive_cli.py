import asyncio
import os
import shutil
from git import Repo
from langchain_community.embeddings import HuggingFaceEmbeddings
from langchain_text_splitters import RecursiveCharacterTextSplitter
from pinecone import Pinecone
from app.core.config import settings
from app.graph import app_graph

class InteractiveCLI:
    def __init__(self):
        self.embeddings = None
        self.pc = Pinecone(api_key=settings.PINECONE_API_KEY)
        self.index = self.pc.Index(settings.PINECONE_INDEX)
        self.current_repo = None
    
    def get_embeddings(self):
        """Lazy load embeddings model"""
        if self.embeddings is None:
            print("Loading embedding model...")
            self.embeddings = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")
        return self.embeddings
    
    def clear_index(self):
        """Clear all vectors from Pinecone index"""
        print("Clearing existing vectors from Pinecone...")
        try:
            self.index.delete(delete_all=True)
            print("Index cleared!")
        except Exception as e:
            print(f"Warning: {e}")
    
    def ingest_repo(self, repo_url: str):
        """Ingest a GitHub repository"""
        print(f"\nIngesting repository: {repo_url}")
        print("=" * 70)
        
        # Extract repo name
        repo_name = repo_url.rstrip("/").split("/")[-1].replace(".git", "")
        self.current_repo = repo_name
        
        base_dir = os.path.join(os.getcwd(), "repos")
        repo_dir = os.path.join(base_dir, repo_name)
        
        # Clone or pull
        if os.path.exists(repo_dir):
            print(f"Repository exists, pulling latest...")
            try:
                repo = Repo(repo_dir)
                repo.remotes.origin.pull()
            except:
                print("Pull failed, re-cloning...")
                shutil.rmtree(repo_dir)
                Repo.clone_from(repo_url, repo_dir)
        else:
            print(f"Cloning to {repo_dir}...")
            os.makedirs(base_dir, exist_ok=True)
            Repo.clone_from(repo_url, repo_dir)
        
        # Read files
        documents = []
        print("Reading files...")
        for root, _, files in os.walk(repo_dir):
            if ".git" in root: continue
            for file in files:
                if file.endswith(('.py', '.js', '.ts', '.jsx', '.tsx', '.md', '.txt', '.java', '.go', '.rs', '.c', '.cpp', '.h')):
                    path = os.path.join(root, file)
                    try:
                        with open(path, "r", encoding="utf-8") as f:
                            content = f.read()
                            documents.append({"text": content, "source": path, "repo": repo_name})
                    except: pass
        
        print(f"Found {len(documents)} files")
        
        # Chunk
        splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=200)
        chunks_text = []
        chunks_meta = []
        
        print("Splitting into chunks...")
        for d in documents:
            splits = splitter.split_text(d["text"])
            for i, s in enumerate(splits):
                chunk_id = f"{repo_name}-{os.path.basename(d['source'])}-{i}"
                chunks_text.append(s)
                chunks_meta.append({"text": s, "source": d["source"], "repo": d["repo"], "chunk_id": chunk_id})
        
        print(f"Created {len(chunks_text)} chunks")
        
        if not chunks_text:
            print("No chunks to embed.")
            return False
        
        # Embed
        print("Generating embeddings...")
        vectors = self.get_embeddings().embed_documents(chunks_text)
        
        # Upsert to Pinecone
        print("Uploading to Pinecone...")
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
            
            self.index.upsert(vectors=to_upsert)
            print(f"   Batch {i//batch_size + 1}/{(len(chunks_text) + batch_size - 1)//batch_size} uploaded")
        
        print(f"\nRepository '{repo_name}' ingested successfully!")
        return True
    
    async def ask_question(self, question: str):
        """Ask a question about the ingested repository"""
        print(f"\nQuestion: {question}")
        print("=" * 70)
        print("Searching and analyzing...\n")
        
        initial_state = {
            "input": question,
            "context": [],
            "github_data": [],
            "messages": [],
            "plan": [],
            "answer": ""
        }
        
        result = await app_graph.ainvoke(initial_state)
        final_output = result.get("final_output", {})
        
        print("Answer:")
        print("-" * 70)
        print(final_output.get('answer', 'No answer generated'))
        print(f"\nConfidence: {final_output.get('confidence', 'unknown')}")
        print("=" * 70)
    
    async def run(self):
        """Main interactive loop"""
        print("\n" + "=" * 70)
        print("Akaza - Interactive Codebase Q&A")
        print("=" * 70)
        
        while True:
            print("\nOptions:")
            print("  1. Ingest a new repository")
            print("  2. Ask a question about current repository")
            print("  3. Exit")
            
            choice = input("\nEnter choice (1/2/3): ").strip()
            
            if choice == "1":
                repo_url = input("\nEnter GitHub repository URL: ").strip()
                if repo_url:
                    # Clear previous data
                    self.clear_index()
                    # Ingest new repo
                    success = self.ingest_repo(repo_url)
                    if success:
                        print(f"\nReady to answer questions about '{self.current_repo}'!")
                else:
                    print("Invalid URL")
            
            elif choice == "2":
                if not self.current_repo:
                    print("\nNo repository ingested yet. Please ingest a repository first (option 1).")
                else:
                    question = input(f"\nAsk about '{self.current_repo}': ").strip()
                    if question:
                        await self.ask_question(question)
                    else:
                        print("Empty question")
            
            elif choice == "3":
                print("\nGoodbye!")
                break
            
            else:
                print("Invalid choice. Please enter 1, 2, or 3.")

if __name__ == "__main__":
    cli = InteractiveCLI()
    asyncio.run(cli.run())
